import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  ADMIN_USERNAME: z.string().default('toni618'),
  ADMIN_INITIAL_PASSWORD: z.string().optional().default(''),
  TRIAL_DURATION_HOURS: z.coerce.number().default(24),
  CORS_ORIGIN: z.string().default('*'),
  AI_PROVIDER: z.string().optional().default(''),
  AI_API_KEY: z.string().optional().default(''),
  AI_BASE_URL: z.string().optional().default(''),
  PAYMENT_PROVIDER: z.string().optional().default(''),
  PAYMENT_WEBHOOK_SECRET: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
