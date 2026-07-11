import { z } from 'zod';
import { DocumentFileCategory } from '../files/files.types.js';
import { AvailabilityStatus, Gender } from './doctors.types.js';

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

/**
 * Like optionalObjectIdSchema, but an explicit empty string clears the
 * reference (null) instead of being treated as "field not provided" — lets
 * editors remove a profile image without uploading a replacement.
 */
const clearableObjectIdSchema = z.preprocess((value) => {
  if (value === '') {
    return null;
  }

  return value;
}, objectIdSchema.nullable().optional());

const documentsSchema = z.preprocess((value) => {
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

const optionalNumberSchema = z.preprocess((value) => {
  if (value === '') {
    return undefined;
  }

  return value;
}, z.coerce.number().min(0).optional());

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

const doctorBodySchema = z
  .object({
    userId: optionalObjectIdSchema,
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.string().trim().email().toLowerCase(),
    phoneNumber: phoneSchema,
    gender: z.nativeEnum(Gender),
    dateOfBirth: z.coerce.date().max(new Date(), 'Date of birth cannot be in the future'),
    specialization: z.string().trim().min(1).max(150),
    qualification: z.string().trim().min(1).max(200),
    licenseNumber: z.string().trim().min(1).max(100),
    yearsOfExperience: z.coerce.number().int().min(0),
    department: z.string().trim().min(1).max(150),
    consultationFee: optionalNumberSchema,
    address: z.string().trim().min(1).max(300),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    country: z.string().trim().min(1).max(100),
    postalCode: z.string().trim().min(1).max(20),
    profileImage: clearableObjectIdSchema,
    documents: documentsSchema,
    documentCategories: documentCategoriesSchema,
    availabilityStatus: z.nativeEnum(AvailabilityStatus).default(AvailabilityStatus.AVAILABLE),
    isActive: booleanSchema.default(true),
  })
  .strip();

export const listDoctorsSchema = {
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
          'specialization',
          'yearsOfExperience',
          'consultationFee',
        ])
        .default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      specialization: z.string().trim().min(1).max(150).optional(),
      department: z.string().trim().min(1).max(150).optional(),
      city: z.string().trim().min(1).max(100).optional(),
      state: z.string().trim().min(1).max(100).optional(),
      availabilityStatus: z.nativeEnum(AvailabilityStatus).optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .strip(),
};

export const createDoctorSchema = {
  body: doctorBodySchema,
};

export const updateDoctorSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: doctorBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
};

export const doctorIdParamSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};
