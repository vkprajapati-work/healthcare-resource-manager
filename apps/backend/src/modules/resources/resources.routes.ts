import { Router } from 'express';
import { validateRequest } from '../../middlewares/validation.js';
import { asyncHandler } from '../../utils/async-handler.js';
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

router.get('/', validateRequest(listResourcesSchema), asyncHandler(listResources));
router.get('/:id', validateRequest(resourceIdParamSchema), asyncHandler(getResource));
router.post('/', validateRequest(createResourceSchema), asyncHandler(createResource));
router.patch('/:id', validateRequest(updateResourceSchema), asyncHandler(updateResource));
router.delete('/:id', validateRequest(resourceIdParamSchema), asyncHandler(deleteResource));

export const resourceRoutes = router;
