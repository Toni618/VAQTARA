import type { FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma.js';
import { env } from '../../config/env.js';

export async function subscriptionRoutes(app: FastifyInstance) {
  app.get('/me/subscription', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user.sub;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.code(404).send({ error: 'NOT_FOUND' });
    const now = new Date();
    let status: string = 'NONE';
    if (user.trialActivatedAt && user.trialExpiresAt) {
      status = now < user.trialExpiresAt ? 'TRIALING' : 'EXPIRED';
    }
    const activeSub = await prisma.subscription.findFirst({
      where: { userId, status: 'ACTIVE', OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }] },
      orderBy: { updatedAt: 'desc' },
    });
    if (activeSub) status = 'ACTIVE';
    return reply.send({
      status,
      trialActivatedAt: user.trialActivatedAt,
      trialExpiresAt: user.trialExpiresAt,
      subscription: activeSub,
      serverTime: now.toISOString(),
    });
  });

  app.post('/me/subscription/activate-trial', { preHandler: [app.authenticate] }, async (request: any, reply) => {
    const userId = request.user.sub;
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw Object.assign(new Error('Not found'), { statusCode: 404 });
      if (user.trialActivatedAt) {
        return { user, alreadyActivated: true };
      }
      const expiresAt = new Date(now.getTime() + env.TRIAL_DURATION_HOURS * 60 * 60 * 1000);
      const updated = await tx.user.update({
        where: { id: userId },
        data: { trialActivatedAt: now, trialExpiresAt: expiresAt },
      });
      await tx.subscription.create({
        data: {
          userId,
          status: 'TRIALING',
          provider: 'internal',
          currentPeriodStart: now,
          currentPeriodEnd: expiresAt,
          metadata: { type: 'trial', hours: env.TRIAL_DURATION_HOURS },
        },
      });
      await tx.auditLog.create({ data: { actorUserId: userId, action: 'TRIAL_ACTIVATED', entityType: 'User', entityId: userId } });
      return { user: updated, alreadyActivated: false };
    });
    return reply.send({
      trialActivatedAt: result.user.trialActivatedAt,
      trialExpiresAt: result.user.trialExpiresAt,
      alreadyActivated: result.alreadyActivated,
      serverTime: now.toISOString(),
    });
  });
}
