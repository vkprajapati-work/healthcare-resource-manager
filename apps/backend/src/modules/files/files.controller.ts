import type { Request, Response } from 'express';
import { createPaginatedResponse, createSuccessResponse } from '../../shared/api-response.js';
import type { AuthUserPayload } from '../auth/auth.types.js';
import { FilesService } from './files.service.js';
import type { FileQueryParams, UploadFileInput } from './files.types.js';

const filesService = new FilesService();

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUserPayload;

  const file = await filesService.upload({
    file: req.file as Express.Multer.File,
    category: req.body.category,
    uploadedBy: user.id,
    metadata: req.body.metadata,
  } as UploadFileInput);

  res.status(201).json(createSuccessResponse(file));
};

export const listFiles = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUserPayload;
  const { files, meta } = await filesService.list(req.query as unknown as FileQueryParams, user);
  res.status(200).json(createPaginatedResponse(files, meta));
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUserPayload;
  const file = await filesService.getById(req.params.id as string, user);
  res.status(200).json(createSuccessResponse(file));
};

export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user as AuthUserPayload;
  const { stream, file } = await filesService.getDownloadStream(req.params.id as string, user);

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(file.originalName)}"`,
  );
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  stream.on('error', () => {
    res.status(404).end();
  });

  stream.pipe(res);
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const result = await filesService.delete(req.params.id as string);
  res.status(200).json(createSuccessResponse(result));
};
