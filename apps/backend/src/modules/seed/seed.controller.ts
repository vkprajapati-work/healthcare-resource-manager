import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import type { AuthUserPayload } from '../auth/auth.types.js';
import { SeedService } from './seed.service.js';
import type { SeedDemoDataQuery } from './seed.validation.js';

const seedService = new SeedService();

export const seedDemoData = async (req: Request, res: Response): Promise<void> => {
  const requester = req.user as AuthUserPayload;
  const { count } = req.query as unknown as SeedDemoDataQuery;
  const summary = await seedService.seedDemoData(requester.id, count);
  res.status(201).json(createSuccessResponse(summary));
};
