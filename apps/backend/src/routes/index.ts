import { Router } from 'express';
import { authRoutes } from '../modules/auth/index.js';
import { doctorRoutes } from '../modules/doctors/index.js';
import { driverRoutes } from '../modules/drivers/index.js';
import { fileRoutes } from '../modules/files/index.js';
import { healthRoutes } from '../modules/health/index.js';
import { resourceRoutes } from '../modules/resources/index.js';
import { seedRoutes } from '../modules/seed/index.js';
import { vehicleRoutes } from '../modules/vehicles/index.js';

export const createApiRouter = (): Router => {
  const router = Router();

  router.use('/', healthRoutes);
  router.use('/auth', authRoutes);
  router.use('/doctors', doctorRoutes);
  router.use('/drivers', driverRoutes);
  router.use('/files', fileRoutes);
  router.use('/resources', resourceRoutes);
  router.use('/seed', seedRoutes);
  router.use('/vehicles', vehicleRoutes);

  return router;
};
