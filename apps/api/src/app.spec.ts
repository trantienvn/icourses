import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

describe('health endpoint', () => {
  let app: (typeof import('./app.js'))['app'];

  beforeAll(async () => {
    Object.assign(process.env, {
      NODE_ENV: 'test', PORT: '3000', WEB_ORIGIN: 'http://localhost:4200',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/test', REDIS_URL: 'redis://localhost:6379',
      JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32), SMTP_HOST: 'localhost',
      SMTP_PORT: '1025', SMTP_USER: '', SMTP_PASSWORD: '', SMTP_FROM: 'noreply@example.test',
      MINIO_ENDPOINT: 'localhost', MINIO_PORT: '9000', MINIO_ACCESS_KEY: 'minio',
      MINIO_SECRET_KEY: 'c'.repeat(32), MINIO_BUCKET: 'test-files', AI_BASE_URL: 'http://localhost:8081',
      AI_API_KEY: '', AI_MODEL: '',
    });
    ({ app } = await import('./app.js'));
  });

  it('returns an API health payload', async () => {
    const response = await request(app).get('/api/v1/health').expect(200);
    expect(response.body.status).toBe('ok');
    expect(Number.isNaN(Date.parse(response.body.timestamp))).toBe(false);
  });
});
