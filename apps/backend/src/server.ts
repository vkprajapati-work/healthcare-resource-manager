import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectToDatabase, disconnectFromDatabase } from './database/mongoose.js';
import { createApp } from './app.js';
import { seedDefaultAdmin } from './modules/auth/auth.seed.js';

const startServer = async (): Promise<void> => {
  const app = createApp();

  const server = app.listen(env.PORT, () => {
    logger.info('Server started', { port: env.PORT, environment: env.NODE_ENV });
  });

  const shutdown = async (): Promise<void> => {
    logger.info('Shutdown signal received');

    server.close(async () => {
      await disconnectFromDatabase();
      logger.info('Server shut down gracefully');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => {
    void shutdown();
  });

  process.on('SIGINT', () => {
    void shutdown();
  });

  await connectToDatabase();
  await seedDefaultAdmin();
};

void startServer().catch((error: unknown) => {
  logger.error('Failed to start server', { error });
  process.exit(1);
});
