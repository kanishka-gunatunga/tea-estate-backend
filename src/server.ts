import 'dotenv/config';

import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';
import { logger } from './utils/logger';

async function startServer() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`, { env: env.NODE_ENV });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

async function shutdown(signal: string) {
  logger.info(`${signal} received. Shutting down gracefully...`);

  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', error);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

void startServer();
