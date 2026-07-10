import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import { getHealthStatus } from './health.service.js';

export const getHealth = (_req: Request, res: Response): void => {
  res.status(200).json(createSuccessResponse(getHealthStatus()));
};
