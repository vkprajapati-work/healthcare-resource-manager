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

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().trim().min(1),
    newPassword: z
      .string()
      .trim()
      .min(8)
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/\d/, 'Password must contain a number'),
  }),
});
