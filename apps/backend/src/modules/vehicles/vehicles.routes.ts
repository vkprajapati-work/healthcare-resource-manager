import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validation.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createVehicle,
  deleteVehicle,
  getAssignedVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from './vehicles.controller.js';
import { uploadVehicleFormFiles } from './vehicles.upload.js';
import {
  createVehicleSchema,
  listVehiclesSchema,
  updateVehicleSchema,
  vehicleIdParamSchema,
} from './vehicles.validation.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(getAssignedVehicle));
router.get('/', validateRequest(listVehiclesSchema), asyncHandler(listVehicles));
router.get('/:id', validateRequest(vehicleIdParamSchema), asyncHandler(getVehicle));
router.post(
  '/',
  uploadVehicleFormFiles,
  validateRequest(createVehicleSchema),
  asyncHandler(createVehicle),
);
router.patch(
  '/:id',
  uploadVehicleFormFiles,
  validateRequest(updateVehicleSchema),
  asyncHandler(updateVehicle),
);
router.delete('/:id', validateRequest(vehicleIdParamSchema), asyncHandler(deleteVehicle));

export const vehicleRoutes = router;
