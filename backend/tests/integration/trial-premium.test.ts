import { describe, it, expect, vi, beforeEach } from 'vitest';
import Fastify from 'fastify';
import sensible from '@fastify/sensible';
import jwt from '@fastify/jwt';
import { subscriptionRoutes } from '../../src/modules/subscriptions/routes.js';
import { requirePremiumAccess } from '../../src/middleware/premium.js';

/**
 * Integration-style tests with mocked Prisma/env to verify 24h trial and
 * server-side premium enforcement logic without requiring PostgreSQL.
 * These do NOT simulate successful external payment verification.
 */

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  subscription: { findFirst: vi.fn(), create: vi.fn() },
  auditLog: { create: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('../../src/lib/prisma.js', () => ({ prisma: prismaMock }));
vi.mock('../../src/config/env.js', () => ({
  env: {
    NODE_ENV: 'test',
    JWT_ACCESS_SECRET: 'test-access-secret-1234567890',
    JWT_ACCESS_TTL: '15m',
    TRIAL_DURATION_HOURS: 24,
  },
}));

async function buildTestApp() {
  const app = Fastify({ logger: false });
  await app.register(sensible);
  await app.register(jwt, { secret: 'test-access-secret-1234567890', sign: { expiresIn: '15m' } });
  app.decorate('authenticate', async (request: any, reply: any) => {
    try { await request.jwtVerify(); } catch { return reply.code(401).send({ error: 'UNAUTHORIZED' }); }
  });
  await app.register(subscriptionRoutes, { prefix: '/api/v1' });
  app.get('/api/v1/premium-probe', { preHandler: [app.authenticate as any, requirePremiumAccess] }, async () => ({ ok: true }));
  return app;
}

describe('trial activation and premium enforcement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('activates 24h trial once (server-authoritative, idempotent)', async () => {
    const app = await buildTestApp();
    const userId = 'u1';
    const now = new Date();
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn({
      user: {
        findUnique: vi.fn().mockResolvedValue({ id: userId, trialActivatedAt: null, trialExpiresAt: null }),
        update: vi.fn().mockImplementation(async ({ data }: any) => ({ id: userId, ...data })),
      },
      subscription: { create: vi.fn().mockResolvedValue({ id: 's1' }) },
      auditLog: { create: vi.fn().mockResolvedValue({ id: 'a1' }) },
    }));

    const token = app.jwt.sign({ sub: userId, role: 'USER' });
    const res = await app.inject({ method: 'POST', url: '/api/v1/me/subscription/activate-trial', headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.alreadyActivated).toBe(false);
    expect(new Date(body.trialExpiresAt).getTime() - new Date(body.trialActivatedAt).getTime()).toBe(24 * 60 * 60 * 1000);

    // second activation: already activated
    prismaMock.$transaction.mockImplementation(async (fn: any) => fn({
      user: { findUnique: vi.fn().mockResolvedValue({ id: userId, trialActivatedAt: body.trialActivatedAt, trialExpiresAt: body.trialExpiresAt }) },
    }));
    const res2 = await app.inject({ method: 'POST', url: '/api/v1/me/subscription/activate-trial', headers: { authorization: `Bearer ${token}` } });
    expect(res2.statusCode).toBe(200);
    expect(res2.json().alreadyActivated).toBe(true);
    await app.close();
  });

  it('denies premium access when no trial/subscription (402) and allows when trial active', async () => {
    const app = await buildTestApp();
    const token = app.jwt.sign({ sub: 'u2', role: 'USER' });
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u2', trialActivatedAt: null, trialExpiresAt: null });
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    const denied = await app.inject({ method: 'GET', url: '/api/v1/premium-probe', headers: { authorization: `Bearer ${token}` } });
    expect(denied.statusCode).toBe(402);
    expect(denied.json().error).toBe('PREMIUM_REQUIRED');

    const future = new Date(Date.now() + 3600_000);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u2', trialActivatedAt: new Date(), trialExpiresAt: future });
    const allowed = await app.inject({ method: 'GET', url: '/api/v1/premium-probe', headers: { authorization: `Bearer ${token}` } });
    expect(allowed.statusCode).toBe(200);
    await app.close();
  });

  it('denies premium access when trial expired and no active subscription', async () => {
    const app = await buildTestApp();
    const token = app.jwt.sign({ sub: 'u3', role: 'USER' });
    const past = new Date(Date.now() - 3600_000);
    prismaMock.user.findUnique.mockResolvedValue({ id: 'u3', trialActivatedAt: new Date(Date.now() - 25 * 3600_000), trialExpiresAt: past });
    prismaMock.subscription.findFirst.mockResolvedValue(null);
    const res = await app.inject({ method: 'GET', url: '/api/v1/premium-probe', headers: { authorization: `Bearer ${token}` } });
    expect(res.statusCode).toBe(402);
    expect(res.json().trialExpired).toBe(true);
    await app.close();
  });
});
