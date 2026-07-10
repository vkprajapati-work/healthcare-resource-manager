import type { NextFunction, Request, Response } from 'express';
import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validation.js';
import { FeatureDisabledError } from '../../shared/errors.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { UserRole } from '../auth/auth.types.js';
import {
  createResource,
  deleteResource,
  getResource,
  listResources,
  updateResource,
} from './resources.controller.js';
import {
  createResourceSchema,
  listResourcesSchema,
  resourceIdParamSchema,
  updateResourceSchema,
} from './resources.validation.js';

const router = Router();

/**
 * Temporarily restricted: create doctors/ambulances through their own rich APIs
 * (`POST /doctors`, `POST /vehicles`) instead, now that `GET /resources` bridges them in.
 * Remove this guard if direct, simple resource creation needs to come back.
 */
export const blockResourceCreation = (_req: Request, _res: Response, next: NextFunction): void => {
  next(
    new FeatureDisabledError(
      'Creating resources directly is temporarily disabled - use POST /api/v1/doctors or POST /api/v1/vehicles instead.',
    ),
  );
};

router.get('/', validateRequest(listResourcesSchema), asyncHandler(listResources));
router.get('/:id', validateRequest(resourceIdParamSchema), asyncHandler(getResource));
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  blockResourceCreation,
  validateRequest(createResourceSchema),
  asyncHandler(createResource),
);
router.patch(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(updateResourceSchema),
  asyncHandler(updateResource),
);
router.delete(
  '/:id',
  authenticate,
  authorize(UserRole.ADMIN),
  validateRequest(resourceIdParamSchema),
  asyncHandler(deleteResource),
);

export const resourceRoutes = router;
