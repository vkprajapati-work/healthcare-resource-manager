import { Router } from 'express';
import { authRoutes } from '../modules/auth/index.js';
import { doctorRoutes } from '../modules/doctors/index.js';
import { fileRoutes } from '../modules/files/index.js';
import { healthRoutes } from '../modules/health/index.js';
import { resourceRoutes } from '../modules/resources/index.js';

export const createApiRouter = (): Router => {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/doctors', doctorRoutes);
  router.use('/files', fileRoutes);
  router.use('/resources', resourceRoutes);

  return router;
};
