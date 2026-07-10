import { z } from 'zod';
import { ResourceType } from './resources.types.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid resource id');

const resourceBodySchema = z
  .object({
    type: z.nativeEnum(ResourceType),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(2000),
    location: z.string().trim().min(1).max(200),
    imageUrl: z.string().trim().url().optional(),
  })
  .strip();

export const listResourcesSchema = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      type: z.nativeEnum(ResourceType).optional(),
      search: z.string().trim().min(1).max(200).optional(),
    })
    .strip(),
};

export const createResourceSchema = {
  body: resourceBodySchema,
};

export const updateResourceSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
  body: resourceBodySchema.partial().refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  }),
};

export const resourceIdParamSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};
