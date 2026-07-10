import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose.js';
import { createApp } from './app.js';
import { seedDefaultAdmin } from './modules/auth/auth.seed.js';

let server:
  | ReturnType<typeof createApp extends never ? never : typeof import('http').createServer>
  | undefined;
let isShuttingDown = false;

const shutdown = async (exitCode = 0): Promise<void> => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info('Graceful shutdown initiated');

  if (server) {
    server.close(async () => {
      await disconnectFromDatabase();
      logger.info('Server shut down gracefully');
      process.exit(exitCode);
    });

    setTimeout(() => {
      logger.error('Graceful shutdown timed out, forcing exit');
      process.exit(1);
    }, 10000);
    return;
  }

  await disconnectFromDatabase();
  process.exit(exitCode);
};

const startServer = async (): Promise<void> => {
  const app = createApp();

  server = app.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT, environment: env.NODE_ENV });
  });

  process.on('SIGTERM', () => {
    void shutdown(0);
  });

  process.on('SIGINT', () => {
    void shutdown(0);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', { error });
    void shutdown(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled rejection', { reason });
    void shutdown(1);
  });

  await connectToDatabase();
  await seedDefaultAdmin();
};

void startServer().catch((error: unknown) => {
  logger.error('Failed to start server', { error });
  void shutdown(1);
});
