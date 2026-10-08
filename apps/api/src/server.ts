import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './observability/logger.js';

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info({ port: env.PORT }, 'API server started');
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    server.close((error) => {
      if (error) {
        logger.error({ err: error }, 'Error during server shutdown');
        process.exitCode = 1;
      }
    });
  });
}
