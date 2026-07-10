import { z } from 'zod';
import { FileCategory } from './files.types.js';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid file id');

export const uploadFileSchema = {
  body: z
    .object({
      category: z.nativeEnum(FileCategory),
      metadata: z
        .string()
        .trim()
        .optional()
        .transform((value, context) => {
          if (!value) {
            return undefined;
          }

          try {
            return JSON.parse(value) as Record<string, unknown>;
          } catch {
            context.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Metadata must be valid JSON',
            });
            return z.NEVER;
          }
        }),
    })
    .strip(),
};

export const fileIdParamSchema = {
  params: z.object({
    id: objectIdSchema,
  }),
};

export const listFilesSchema = {
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      category: z.nativeEnum(FileCategory).optional(),
      uploadedBy: objectIdSchema.optional(),
    })
    .strip(),
};
