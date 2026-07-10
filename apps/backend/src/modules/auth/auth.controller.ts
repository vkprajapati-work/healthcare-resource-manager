import type { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticationError, ValidationError } from '../../shared/errors.js';
import { createSuccessResponse } from '../../shared/api-response.js';
import { AuthService } from './auth.service.js';
import { changePasswordSchema, loginSchema, refreshSchema } from './auth.validation.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies.js';
import type { AuthenticatedRequest } from './auth.types.js';

const authService = new AuthService();

const parseOrThrow = <T>(schema: z.ZodType<T>, input: unknown): T => {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    const details = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    throw new ValidationError('Validation failed', details);
  }

  return parsed.data;
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = parseOrThrow(loginSchema, req);
  const result = await authService.login(parsed.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json(createSuccessResponse({ user: result.user }));
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const parsed = parseOrThrow(refreshSchema, { refreshToken: req.cookies?.refreshToken });

  if (!parsed.refreshToken) {
    throw new AuthenticationError('Refresh token is required');
  }

  const result = await authService.refreshToken({ refreshToken: parsed.refreshToken });
  setAuthCookies(res, result.accessToken, parsed.refreshToken);
  res.status(200).json(createSuccessResponse({ accessToken: result.accessToken }));
};

export const logout = (_req: Request, res: Response): void => {
  clearAuthCookies(res);
  res.status(200).json(createSuccessResponse({ message: 'Logged out successfully' }));
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const user = await authService.me((req.user as NonNullable<typeof req.user>).id);
  res.status(200).json(createSuccessResponse({ user }));
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const parsed = parseOrThrow(changePasswordSchema, req);
  const userId = (req.user as NonNullable<typeof req.user>).id;
  await authService.changePassword(userId, parsed.body);
  res.status(200).json(createSuccessResponse({ message: 'Password changed successfully' }));
};
