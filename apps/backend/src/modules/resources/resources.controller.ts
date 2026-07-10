import type { Request, Response } from 'express';
import { createPaginatedResponse, createSuccessResponse } from '../../shared/api-response.js';
import { ResourcesService } from './resources.service.js';
import type {
  CreateResourceInput,
  ResourceListQuery,
  UpdateResourceInput,
} from './resources.types.js';

const resourcesService = new ResourcesService();

export const listResources = async (req: Request, res: Response): Promise<void> => {
  const { resources, meta } = await resourcesService.list(
    req.query as unknown as ResourceListQuery,
  );
  res.status(200).json(createPaginatedResponse(resources, meta));
};

export const getResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await resourcesService.getById(req.params.id as string);
  res.status(200).json(createSuccessResponse(resource));
};

export const createResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await resourcesService.create(req.body as CreateResourceInput);
  res.status(201).json(createSuccessResponse(resource));
};

export const updateResource = async (req: Request, res: Response): Promise<void> => {
  const resource = await resourcesService.update(
    req.params.id as string,
    req.body as UpdateResourceInput,
  );
  res.status(200).json(createSuccessResponse(resource));
};

export const deleteResource = async (req: Request, res: Response): Promise<void> => {
  const result = await resourcesService.delete(req.params.id as string);
  res.status(200).json(createSuccessResponse(result));
};
