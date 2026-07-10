import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import { DriversService } from './drivers.service.js';
import type {
  DriverAccessContext,
  DriverFormInput,
  DriverListQuery,
  DriverUploadedFiles,
  DriverUpdateFormInput,
} from './drivers.types.js';

const driversService = new DriversService();

const getAccessContext = (req: Request): DriverAccessContext => ({
  userId: req.user?.id ?? '',
  role: req.user?.role ?? '',
});

export const listDrivers = async (req: Request, res: Response): Promise<void> => {
  const { drivers, meta } = await driversService.list(
    req.query as unknown as DriverListQuery,
    getAccessContext(req),
  );
  res.status(200).json({ success: true, data: drivers, meta });
};

export const getDriver = async (req: Request, res: Response): Promise<void> => {
  const driver = await driversService.getById(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(driver));
};

export const getOwnDriverProfile = async (req: Request, res: Response): Promise<void> => {
  const driver = await driversService.getOwnProfile(getAccessContext(req));
  res.status(200).json(createSuccessResponse(driver));
};

export const createDriver = async (req: Request, res: Response): Promise<void> => {
  const driver = await driversService.createFromForm(
    req.body as DriverFormInput,
    req.files as DriverUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(201).json(createSuccessResponse(driver));
};

export const updateDriver = async (req: Request, res: Response): Promise<void> => {
  const driver = await driversService.updateFromForm(
    req.params.id as string,
    req.body as DriverUpdateFormInput,
    req.files as DriverUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(200).json(createSuccessResponse(driver));
};

export const deleteDriver = async (req: Request, res: Response): Promise<void> => {
  const result = await driversService.delete(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(result));
};
