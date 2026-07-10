import { z } from 'zod';
import { DocumentFileCategory } from '../files/files.types.js';
import { VehicleStatus, VehicleType } from './vehicles.types.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');

const optionalObjectIdSchema = z.preprocess((value) => {
  if (value === '') {
    return undefined;
  }

  return value;
}, objectIdSchema.optional());

const objectIdArraySchema = z.preprocess((value) => {
  if (value === '' || typeof value === 'undefined') {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return [];
    }

    if (trimmedValue.startsWith('[')) {
      try {
        return JSON.parse(trimmedValue) as unknown;
      } catch {
        return value;
      }
    }

    return trimmedValue.split(',').map((item) => item.trim());
  }

  return value;
}, z.array(objectIdSchema).default([]));

const documentCategoriesSchema = z.preprocess((value) => {
  if (value === '' || typeof value === 'undefined') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return undefined;
    }

    return trimmedValue.split(',').map((item) => item.trim());
  }

  return value;
}, z.array(z.nativeEnum(DocumentFileCategory)).optional());

const optionalDateSchema = z.preprocess((value) => {
  if (value === '') {
    return undefined;
  }

  return value;
}, z.coerce.date().optional());

const booleanSchema = z.preprocess((value) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalizedValue = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'on'].includes(normalizedValue)) {
      return true;
    }

    if (['false', '0', 'no', 'off'].includes(normalizedValue)) {
      return false;
    }
  }

  return value;
}, z.boolean());

const vehicleBodySchema = z
  .object({
    registrationNumber: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
    vehicleNumber: z.string().trim().min(1).max(50).transform((value) => value.toUpperCase()),
    vehicleType: z.nativeEnum(VehicleType),
    brand: z.string().trim().min(1).max(100),
    model: z.string().trim().min(1).max(100),
    manufactureYear: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
    color: z.string().trim().min(1).max(50),
    seatingCapacity: z.coerce.number().int().min(1),
    patientCapacity: z.coerce.number().int().min(1),
    assignedDriver: optionalObjectIdSchema,
    photos: objectIdArraySchema,
    documents: objectIdArraySchema,
    documentCategories: documentCategoriesSchema,
    insuranceExpiry: z.coerce.date(),
    fitnessExpiry: z.coerce.date(),
    pollutionExpiry: z.coerce.date(),
    lastServiceDate: optionalDateSchema,
    nextServiceDate: optionalDateSchema,
    status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE),
    isActive: booleanSchema.default(true),
  })
  .strip();

export const listVehiclesSchema = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().min(1).max(200).optional(),
      sortBy: z
        .enum([
          'createdAt',
          'updatedAt',
          'registrationNumber',
          'vehicleNumber',
          'brand',
          'model',
          'manufactureYear',
          'nextServiceDate',
        ])
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      vehicleType: z.nativeEnum(VehicleType).optional(),
      status: z.nativeEnum(VehicleStatus).optional(),
      brand: z.string().trim().min(1).max(100).optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .strip(),
};

export const createVehicleSchema = {
  body: vehicleBodySchema,
};

export const updateVehicleSchema = {
  params: z.object({ id: objectIdSchema }),
  body: vehicleBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
};

export const vehicleIdParamSchema = {
  params: z.object({ id: objectIdSchema }),
};
