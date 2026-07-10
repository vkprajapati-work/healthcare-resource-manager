import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validation.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createDriver,
  deleteDriver,
  getDriver,
  getOwnDriverProfile,
  listDrivers,
  updateDriver,
} from './drivers.controller.js';
import { uploadDriverFormFiles } from './drivers.upload.js';
import {
  createDriverSchema,
  driverIdParamSchema,
  listDriversSchema,
  updateDriverSchema,
} from './drivers.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(getOwnDriverProfile));
router.get('/', validateRequest(listDriversSchema), asyncHandler(listDrivers));
router.get('/:id', validateRequest(driverIdParamSchema), asyncHandler(getDriver));
router.post('/', uploadDriverFormFiles, validateRequest(createDriverSchema), asyncHandler(createDriver));
router.patch(
  '/:id',
  uploadDriverFormFiles,
  validateRequest(updateDriverSchema),
  asyncHandler(updateDriver),
);
router.delete('/:id', validateRequest(driverIdParamSchema), asyncHandler(deleteDriver));

export const driverRoutes = router;
