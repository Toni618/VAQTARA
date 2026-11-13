import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import authPlugin from './plugins/auth.js';
import { env } from './config/env.js';
import { healthRoutes } from './modules/health/routes.js';
import { authRoutes } from './modules/auth/routes.js';
import { subscriptionRoutes } from './modules/subscriptions/routes.js';
import { prisma } from './lib/prisma.js';

export async function buildApp() {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: env.NODE_ENV === 'development' ? 'info' : 'warn' },
  });

  await app.register(sensible);
  await app.register(helmet, { global: true });
  await app.register(cors, { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN, credentials: true });
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
  await app.register(authPlugin);

  app.setErrorHandler((error, _request, reply) => {
    if ((error as any).validation) {
      return reply.code(400).send({ error: 'VALIDATION_ERROR', message: error.message });
    }
    const status = (error as any).statusCode || 500;
    if (status >= 500) app.log.error(error);
    return reply.code(status).send({
      error: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
      message: status >= 500 ? 'Internal server error' : error.message,
    });
  });

  await app.register(healthRoutes, { prefix: `${env.API_PREFIX}` });
  await app.register(authRoutes, { prefix: `${env.API_PREFIX}` });
  await app.register(subscriptionRoutes, { prefix: `${env.API_PREFIX}` });

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
