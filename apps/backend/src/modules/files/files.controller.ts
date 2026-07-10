import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import { FilesService } from './files.service.js';
import type { FileQueryParams, UploadFileInput } from './files.types.js';

const filesService = new FilesService();

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  const user = req.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      errors: [],
    });
    return;
  }

  const file = await filesService.upload({
    file: req.file as Express.Multer.File,
    category: req.body.category,
    uploadedBy: user.id,
    metadata: req.body.metadata,
  } as UploadFileInput);

  res.status(201).json(createSuccessResponse(file));
};

export const listFiles = async (req: Request, res: Response): Promise<void> => {
  const { files, meta } = await filesService.list(req.query as unknown as FileQueryParams);
  res.status(200).json({ success: true, data: files, meta });
};

export const getFile = async (req: Request, res: Response): Promise<void> => {
  const file = await filesService.getById(req.params.id as string);
  res.status(200).json(createSuccessResponse(file));
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const result = await filesService.delete(req.params.id as string);
  res.status(200).json(createSuccessResponse(result));
};
