import process from 'node:process';
import mongoose from 'mongoose';
import type { HealthStatusPayload } from './health.types.js';

export const getHealthStatus = (): HealthStatusPayload => {
  const memoryUsage = process.memoryUsage();
  const databaseStatus = mongoose.connection.readyState === 1 ? 'connected' : 'connecting';

  return {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV ?? 'development',
    version: process.env.npm_package_version ?? '0.1.0',
    application: {
      name: 'healthcare-resource-manager-backend',
      status: 'running',
    },
    database: {
      status: databaseStatus,
    },
    memory: {
      rss: memoryUsage.rss,
      heapUsed: memoryUsage.heapUsed,
      heapTotal: memoryUsage.heapTotal,
      external: memoryUsage.external,
    },
  };
};
