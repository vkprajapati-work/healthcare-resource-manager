import type { Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { createErrorResponse, createSuccessResponse } from '../../shared/api-response.js';
import { AuthService } from './auth.service.js';
import { loginSchema, refreshSchema } from './auth.validation.js';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookies.js';
import type { AuthenticatedRequest } from './auth.types.js';

const authService = new AuthService();

const buildValidationErrorResponse = (error: z.ZodError) => {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

  return createErrorResponse('Validation failed', details, 'VALIDATION_ERROR');
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req);
  if (!parsed.success) {
    res.status(400).json(buildValidationErrorResponse(parsed.error));
    return;
  }

  const result = await authService.login(parsed.data.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.status(200).json(createSuccessResponse({ user: result.user }));
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const parsed = refreshSchema.safeParse({ refreshToken: req.cookies?.refreshToken });
  if (!parsed.success) {
    res.status(400).json(buildValidationErrorResponse(parsed.error));
    return;
  }

  const refreshToken = parsed.data.refreshToken;

  if (!refreshToken) {
    res
      .status(401)
      .json(createErrorResponse('Refresh token is required', [], 'AUTHENTICATION_ERROR'));
    return;
  }

  const result = await authService.refreshToken({ refreshToken });
  setAuthCookies(res, result.accessToken, refreshToken);
  res.status(200).json(createSuccessResponse({ accessToken: result.accessToken }));
};

export const logout = (_req: Request, res: Response): void => {
  clearAuthCookies(res);
  res.status(200).json(createSuccessResponse({ message: 'Logged out successfully' }));
};

export const me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res
      .status(401)
      .json(createErrorResponse('Authentication required', [], 'AUTHENTICATION_ERROR'));
    return;
  }

  const user = await authService.me(req.user.id);
  res.status(200).json(createSuccessResponse({ user }));
};

export const protectedRoute = [authenticate, authorize('ADMIN')];
