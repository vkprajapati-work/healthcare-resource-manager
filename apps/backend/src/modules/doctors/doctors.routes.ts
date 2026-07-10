import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { validateRequest } from '../../middlewares/validation.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
  createDoctor,
  deleteDoctor,
  getDoctor,
  getOwnDoctorProfile,
  listDoctors,
  updateDoctor,
} from './doctors.controller.js';
import {
  createDoctorSchema,
  doctorIdParamSchema,
  listDoctorsSchema,
  updateDoctorSchema,
} from './doctors.validation.js';
import { uploadDoctorFormFiles } from './doctors.upload.js';

const router = Router();

router.use(authenticate);

router.get('/me', asyncHandler(getOwnDoctorProfile));
router.get('/', validateRequest(listDoctorsSchema), asyncHandler(listDoctors));
router.get('/:id', validateRequest(doctorIdParamSchema), asyncHandler(getDoctor));
router.post(
  '/',
  uploadDoctorFormFiles,
  validateRequest(createDoctorSchema),
  asyncHandler(createDoctor),
);
router.patch(
  '/:id',
  uploadDoctorFormFiles,
  validateRequest(updateDoctorSchema),
  asyncHandler(updateDoctor),
);
router.delete('/:id', validateRequest(doctorIdParamSchema), asyncHandler(deleteDoctor));

export const doctorRoutes = router;
