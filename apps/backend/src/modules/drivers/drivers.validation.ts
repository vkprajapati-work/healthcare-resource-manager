import { z } from 'zod';
import { DocumentFileCategory } from '../files/files.types.js';
import { DriverAvailabilityStatus, DriverGender } from './drivers.types.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ObjectId');
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[1-9]\d{7,14}$/, 'Invalid phone number');

const optionalObjectIdSchema = z.preprocess((value) => {
  if (value === '') {
    return undefined;
  }

  return value;
}, objectIdSchema.optional());

const stringArraySchema = z.preprocess((value) => {
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

const documentCategoriesSchema = z.preprocess(
  (value) => {
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
  },
  z.array(z.nativeEnum(DocumentFileCategory)).optional(),
);

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

const driverBodySchema = z
  .object({
    userId: optionalObjectIdSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().toLowerCase(),
    phoneNumber: phoneSchema,
    gender: z.nativeEnum(DriverGender),
    dateOfBirth: z.coerce.date().max(new Date(), 'Date of birth cannot be in the future'),
    employeeId: z.string().trim().min(1).max(100),
    joiningDate: z.coerce.date(),
    licenseNumber: z.string().trim().min(1).max(100),
    licenseExpiry: z.coerce.date(),
    yearsOfExperience: z.coerce.number().int().min(0),
    assignedVehicle: optionalObjectIdSchema,
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
    profileImage: optionalObjectIdSchema,
    documents: stringArraySchema,
    documentCategories: documentCategoriesSchema,
    availabilityStatus: z
      .nativeEnum(DriverAvailabilityStatus)
      .default(DriverAvailabilityStatus.AVAILABLE),
    isActive: booleanSchema.default(true),
  })
  .strip();

export const listDriversSchema = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().min(1).max(200).optional(),
      sortBy: z
        .enum([
          'createdAt',
          'updatedAt',
          'firstName',
          'lastName',
          'employeeId',
          'joiningDate',
          'licenseExpiry',
          'yearsOfExperience',
        ])
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      city: z.string().trim().min(1).max(100).optional(),
      state: z.string().trim().min(1).max(100).optional(),
      availabilityStatus: z.nativeEnum(DriverAvailabilityStatus).optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .strip(),
};

export const createDriverSchema = {
  body: driverBodySchema,
};

export const updateDriverSchema = {
  params: z.object({ id: objectIdSchema }),
  body: driverBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
};

export const driverIdParamSchema = {
  params: z.object({ id: objectIdSchema }),
};
