import { randomUUID } from 'node:crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { logger } from './observability/logger.js';

const openApiSpec = {
  openapi: '3.1.0',
  info: { title: 'ICourses API', version: '1.0.0', description: 'API quản lý lớp học và thi trực tuyến.' },
  servers: [{ url: '/api/v1' }],
  paths: {
    '/health': {
      get: {
        summary: 'Kiểm tra trạng thái API',
        responses: { '200': { description: 'API đang hoạt động', content: { 'application/json': { schema: { type: 'object', properties: { status: { type: 'string', const: 'ok' }, timestamp: { type: 'string', format: 'date-time' } } } } } } },
      },
    },
  },
};

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger, genReqId: (req) => req.headers['x-request-id']?.toString() || randomUUID() }));
app.get('/api/v1/openapi.json', (_req, res) => res.json(openApiSpec));
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((_req, res) => {
  res.status(404).json({ code: 'NOT_FOUND', message: 'Không tìm thấy tài nguyên.' });
});

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(error);
  logger.error({ err: error }, 'Unhandled request error');
  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Đã xảy ra lỗi hệ thống.' });
});
