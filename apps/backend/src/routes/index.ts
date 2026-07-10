import { Router } from 'express';
import { authRoutes } from '../modules/auth/index.js';
import { healthRoutes } from '../modules/health/index.js';

export const createApiRouter = (): Router => {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/auth', authRoutes);

  return router;
};
