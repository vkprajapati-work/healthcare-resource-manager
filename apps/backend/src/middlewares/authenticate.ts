import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthRepository } from '../modules/auth/auth.repository.js';
import type { AuthUserPayload } from '../modules/auth/auth.types.js';
import { AuthenticationError, PasswordChangeRequiredError } from '../shared/errors.js';

const MUST_CHANGE_PASSWORD_ALLOWLIST = new Set([
  '/api/v1/auth/change-password',
  '/api/v1/auth/logout',
  '/api/v1/auth/me',
]);

const isMustChangePasswordExempt = (req: Request): boolean => {
  const path = req.originalUrl.split('?')[0] ?? '';
  return MUST_CHANGE_PASSWORD_ALLOWLIST.has(path);
};

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    next(new AuthenticationError('Authentication required'));
    return;
  }

  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthUserPayload & {
      iat?: number;
      exp?: number;
    };
    const user = await new AuthRepository().findById(payload.id);

    if (!user || !user.isActive) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    req.user = {
      id: String(user._id),
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      mustChangePassword: user.mustChangePassword,
    };

    if (user.mustChangePassword && !isMustChangePasswordExempt(req)) {
      next(new PasswordChangeRequiredError());
      return;
    }

    next();
  } catch {
    next(new AuthenticationError('Authentication required'));
  }
};
