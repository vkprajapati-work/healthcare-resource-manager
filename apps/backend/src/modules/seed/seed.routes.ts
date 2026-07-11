import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { env } from '../../config/env.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validation.js';
import { NotFoundError } from '../../shared/errors.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { UserRole } from '../auth/auth.types.js';
import { seedDemoData } from './seed.controller.js';
import { seedDemoDataSchema } from './seed.validation.js';

const router = Router();

/** Mock-data seeding has no place in a real deployment - hide the route entirely outside dev/test. */
const blockInProduction = (_req: Request, _res: Response, next: NextFunction): void => {
  if (env.NODE_ENV === 'production') {
    next(new NotFoundError('Route not found'));
    return;
  }

  next();
};

router.post(
  '/demo-data',
  blockInProduction,
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(seedDemoDataSchema),
  asyncHandler(seedDemoData),
);

export const seedRoutes = router;
