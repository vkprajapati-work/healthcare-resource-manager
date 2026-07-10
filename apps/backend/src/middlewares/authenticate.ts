import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthRepository } from '../modules/auth/auth.repository.js';
import type { AuthUserPayload } from '../modules/auth/auth.types.js';
import { AppError } from '../shared/errors.js';

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies?.accessToken as string | undefined;

  if (!token) {
    next(new AppError('Authentication required', 401));
    return;
  }

  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AuthUserPayload & {
      iat?: number;
      exp?: number;
    };
    const user = await new AuthRepository().findById(payload.id);

    if (!user || !user.isActive) {
      next(new AppError('Authentication required', 401));
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

    next();
  } catch {
    next(new AppError('Authentication required', 401));
  }
};
