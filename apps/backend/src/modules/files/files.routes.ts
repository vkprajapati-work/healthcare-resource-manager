import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validateRequest } from '../../middlewares/validation.js';
import { UserRole } from '../auth/auth.types.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { deleteFile, getFile, listFiles, uploadFile } from './files.controller.js';
import { fileIdParamSchema, listFilesSchema, uploadFileSchema } from './files.validation.js';
import { uploadSingleFile } from './upload.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadSingleFile, validateRequest(uploadFileSchema), asyncHandler(uploadFile));
router.get('/', validateRequest(listFilesSchema), asyncHandler(listFiles));
router.get('/:id', validateRequest(fileIdParamSchema), asyncHandler(getFile));
router.delete(
  '/:id',
  authorize(UserRole.ADMIN),
  validateRequest(fileIdParamSchema),
  asyncHandler(deleteFile),
);

export const fileRoutes = router;
