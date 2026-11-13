import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({ status: 'ok', service: 'ravendora-backend', version: '1.0.0' }));
  app.get('/ready', async () => ({ status: 'ready' }));
}
