import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import { VehiclesService } from './vehicles.service.js';
import type {
  VehicleAccessContext,
  VehicleFormInput,
  VehicleListQuery,
  VehicleUploadedFiles,
  VehicleUpdateFormInput,
} from './vehicles.types.js';

const vehiclesService = new VehiclesService();

const getAccessContext = (req: Request): VehicleAccessContext => ({
  userId: req.user?.id ?? '',
  role: req.user?.role ?? '',
});

export const listVehicles = async (req: Request, res: Response): Promise<void> => {
  const { vehicles, meta } = await vehiclesService.list(
    req.query as unknown as VehicleListQuery,
    getAccessContext(req),
  );
  res.status(200).json({ success: true, data: vehicles, meta });
};

export const getVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehiclesService.getById(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(vehicle));
};

export const getAssignedVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehiclesService.getAssignedVehicle(getAccessContext(req));
  res.status(200).json(createSuccessResponse(vehicle));
};

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehiclesService.createFromForm(
    req.body as VehicleFormInput,
    req.files as VehicleUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(201).json(createSuccessResponse(vehicle));
};

export const updateVehicle = async (req: Request, res: Response): Promise<void> => {
  const vehicle = await vehiclesService.updateFromForm(
    req.params.id as string,
    req.body as VehicleUpdateFormInput,
    req.files as VehicleUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(200).json(createSuccessResponse(vehicle));
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  const result = await vehiclesService.delete(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(result));
};
