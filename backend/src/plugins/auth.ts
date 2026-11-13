import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../config/env.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { sub: string; role: 'USER' | 'ADMIN'; sid?: string };
    user: { sub: string; role: 'USER' | 'ADMIN'; sid?: string };
  }
}

export default fp(async (app) => {
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: env.JWT_ACCESS_TTL },
  });

  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }
  });

  app.decorate('requireAdmin', async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
      if (request.user?.role !== 'ADMIN') {
        return reply.code(403).send({ error: 'FORBIDDEN', message: 'Admin access required' });
      }
    } catch {
      return reply.code(401).send({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    requireAdmin: any;
  }
}
