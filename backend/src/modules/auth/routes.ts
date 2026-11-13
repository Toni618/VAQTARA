import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { hashPassword, verifyPassword, hashToken } from '../../lib/auth.js';
import { env } from '../../config/env.js';
import jwt from 'jsonwebtoken';

const registerSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(128),
  displayName: z.string().max(100).optional(),
  email: z.string().email().optional(),
  preferredLanguage: z.enum(['FA', 'EN']).default('FA'),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

function signRefresh(payload: { sub: string; role: 'USER' | 'ADMIN'; sid: string }) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_TTL as any });
}

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', async (request, reply) => {
    const body = registerSchema.parse(request.body);
    const existing = await prisma.user.findUnique({ where: { username: body.username } });
    if (existing) return reply.code(409).send({ error: 'USERNAME_TAKEN', message: 'Username already exists' });
    if (body.email) {
      const exEmail = await prisma.user.findUnique({ where: { email: body.email } });
      if (exEmail) return reply.code(409).send({ error: 'EMAIL_TAKEN', message: 'Email already exists' });
    }
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        passwordHash,
        displayName: body.displayName,
        preferredLanguage: body.preferredLanguage,
        profile: { create: { onboardingDone: false, interests: [], personalGoals: [] } },
        preferences: { create: {} },
      },
      select: { id: true, username: true, role: true, preferredLanguage: true, createdAt: true },
    });
    await prisma.auditLog.create({ data: { actorUserId: user.id, action: 'USER_REGISTERED', entityType: 'User', entityId: user.id } });
    return reply.code(201).send({ user });
  });

  app.post('/auth/login', async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const user = await prisma.user.findUnique({ where: { username: body.username } });
    if (!user || user.status !== 'ACTIVE') {
      return reply.code(401).send({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password' });
    }
    const ok = await verifyPassword(user.passwordHash, body.password);
    if (!ok) return reply.code(401).send({ error: 'INVALID_CREDENTIALS', message: 'Invalid username or password' });

    const session = await prisma.deviceSession.create({
      data: {
        userId: user.id,
        refreshTokenHash: 'pending',
        userAgent: request.headers['user-agent'],
        ipAddress: request.ip,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    const accessToken = app.jwt.sign({ sub: user.id, role: user.role, sid: session.id });
    const refreshToken = signRefresh({ sub: user.id, role: user.role, sid: session.id });
    await prisma.deviceSession.update({ where: { id: session.id }, data: { refreshTokenHash: hashToken(refreshToken) } });
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await prisma.auditLog.create({ data: { actorUserId: user.id, action: 'USER_LOGIN', entityType: 'DeviceSession', entityId: session.id, ipAddress: request.ip } });

    return reply.send({
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, role: user.role, preferredLanguage: user.preferredLanguage, displayName: user.displayName },
    });
  });

  app.post('/auth/refresh', async (request, reply) => {
    const schema = z.object({ refreshToken: z.string().min(1) });
    const { refreshToken } = schema.parse(request.body);
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch {
      return reply.code(401).send({ error: 'INVALID_TOKEN', message: 'Invalid refresh token' });
    }
    const session = await prisma.deviceSession.findUnique({ where: { id: payload.sid } });
    if (!session || session.userId !== payload.sub || session.revokedAt || session.expiresAt < new Date()) {
      return reply.code(401).send({ error: 'SESSION_INVALID', message: 'Session invalid or expired' });
    }
    if (session.refreshTokenHash !== hashToken(refreshToken)) {
      await prisma.deviceSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
      return reply.code(401).send({ error: 'TOKEN_REUSE', message: 'Refresh token reuse detected' });
    }
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== 'ACTIVE') return reply.code(401).send({ error: 'UNAUTHORIZED' });
    const newRefresh = signRefresh({ sub: user.id, role: user.role, sid: session.id });
    await prisma.deviceSession.update({ where: { id: session.id }, data: { refreshTokenHash: hashToken(newRefresh) } });
    const accessToken = app.jwt.sign({ sub: user.id, role: user.role, sid: session.id });
    return reply.send({ accessToken, refreshToken: newRefresh });
  });

  app.post('/auth/logout', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const sid = request.user?.sid;
    if (sid) await prisma.deviceSession.update({ where: { id: sid }, data: { revokedAt: new Date() } }).catch(() => {});
    await prisma.auditLog.create({ data: { actorUserId: request.user.sub, action: 'USER_LOGOUT', entityType: 'DeviceSession', entityId: sid } });
    return reply.send({ ok: true });
  });
}
