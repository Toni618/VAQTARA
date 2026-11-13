import type { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';

/**
 * Server-authoritative premium/trial gate.
 * Never trust client-side status. Apply to premium endpoints.
 */
export async function requirePremiumAccess(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user?.sub) return reply.code(401).send({ error: 'UNAUTHORIZED' });
  if (user.role === 'ADMIN') return; // admin bypass for management contexts as appropriate

  const now = new Date();
  const dbUser = await prisma.user.findUnique({ where: { id: user.sub } });
  if (!dbUser) return reply.code(401).send({ error: 'UNAUTHORIZED' });

  const trialOk = !!(dbUser.trialActivatedAt && dbUser.trialExpiresAt && now < dbUser.trialExpiresAt);
  if (trialOk) return;

  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: dbUser.id,
      status: 'ACTIVE',
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
    },
  });
  if (activeSub) return;

  return reply.code(402).send({
    error: 'PREMIUM_REQUIRED',
    message: 'Active trial or subscription required',
    trialExpired: !!(dbUser.trialActivatedAt && dbUser.trialExpiresAt && now >= dbUser.trialExpiresAt),
    serverTime: now.toISOString(),
  });
}
