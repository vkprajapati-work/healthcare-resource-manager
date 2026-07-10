import type { Express } from 'express';
import express from 'express';
import { env } from '../config/env.js';
import { createApiRouter } from '../routes/index.js';
import { notFoundHandler } from '../middlewares/not-found.js';

export const registerRoutes = (app: Express): void => {
  app.use(env.FILE_PUBLIC_BASE_URL, express.static(env.LOCAL_STORAGE_ROOT));
  app.use('/api/v1', createApiRouter());
  app.use(notFoundHandler);
};
