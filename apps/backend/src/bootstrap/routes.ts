import type { Express } from 'express';
import { createApiRouter } from '../routes/index.js';
import { notFoundHandler } from '../middlewares/not-found.js';

export const registerRoutes = (app: Express): void => {
  app.use('/api/v1', createApiRouter());
  app.use(notFoundHandler);
};
