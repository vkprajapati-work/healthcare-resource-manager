import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().trim().min(1),
  }),
});

export const refreshSchema = z.object({
  refreshToken: z.string().trim().min(1).optional(),
});
