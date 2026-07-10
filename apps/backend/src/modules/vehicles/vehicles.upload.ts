import multer from 'multer';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../shared/errors.js';
import { getAllowedUploadMimeTypes } from '../files/storage.service.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    files: env.VEHICLE_MAX_UPLOAD_FILES,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = getAllowedUploadMimeTypes();

    if (!allowedMimeTypes.has(file.mimetype.toLowerCase())) {
      callback(new BadRequestError('File type is not allowed'));
      return;
    }

    callback(null, true);
  },
});

export const uploadVehicleFormFiles = upload.fields([
  { name: 'photos', maxCount: 10 },
  { name: 'documents', maxCount: 10 },
]);
