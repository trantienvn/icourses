import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  WEB_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535),
  SMTP_USER: z.string(),
  SMTP_PASSWORD: z.string(),
  SMTP_FROM: z.string().email(),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().int().min(1).max(65535),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(16),
  MINIO_BUCKET: z.string().min(3),
  AI_BASE_URL: z.string().url(),
  AI_API_KEY: z.string(),
  AI_MODEL: z.string(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Do not echo supplied values: environment variables may contain secrets.
  console.error('Invalid environment configuration:', parsed.error.issues.map(({ path, message }) => `${path.join('.')}: ${message}`).join('; '));
  process.exit(1);
}

export const env = parsed.data;
