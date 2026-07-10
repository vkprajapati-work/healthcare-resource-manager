import type { Request, Response } from 'express';
import { createSuccessResponse } from '../../shared/api-response.js';
import { DoctorsService } from './doctors.service.js';
import type {
  DoctorAccessContext,
  DoctorFormInput,
  DoctorListQuery,
  DoctorUploadedFiles,
  DoctorUpdateFormInput,
} from './doctors.types.js';

const doctorsService = new DoctorsService();

const getAccessContext = (req: Request): DoctorAccessContext => ({
  userId: req.user?.id ?? '',
  role: req.user?.role ?? '',
});

export const listDoctors = async (req: Request, res: Response): Promise<void> => {
  const { doctors, meta } = await doctorsService.list(
    req.query as unknown as DoctorListQuery,
    getAccessContext(req),
  );
  res.status(200).json({ success: true, data: doctors, meta });
};

export const getDoctor = async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorsService.getById(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(doctor));
};

export const getOwnDoctorProfile = async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorsService.getOwnProfile(getAccessContext(req));
  res.status(200).json(createSuccessResponse(doctor));
};

export const createDoctor = async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorsService.createFromForm(
    req.body as DoctorFormInput,
    req.files as DoctorUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(201).json(createSuccessResponse(doctor));
};

export const updateDoctor = async (req: Request, res: Response): Promise<void> => {
  const doctor = await doctorsService.updateFromForm(
    req.params.id as string,
    req.body as DoctorUpdateFormInput,
    req.files as DoctorUploadedFiles | undefined,
    getAccessContext(req),
  );
  res.status(200).json(createSuccessResponse(doctor));
};

export const deleteDoctor = async (req: Request, res: Response): Promise<void> => {
  const result = await doctorsService.delete(req.params.id as string, getAccessContext(req));
  res.status(200).json(createSuccessResponse(result));
};
