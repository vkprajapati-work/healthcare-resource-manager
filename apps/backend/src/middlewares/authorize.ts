import type { NextFunction, Request, Response } from 'express';
import { AuthenticationError, AuthorizationError } from '../shared/errors.js';
import type { UserRole } from '../modules/auth/auth.types.js';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      next(new AuthenticationError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      next(new AuthorizationError('Forbidden'));
      return;
    }

    next();
  };
};
