import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../shared/errors.js';
import type { UserRole } from '../modules/auth/auth.types.js';

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user || !allowedRoles.includes(user.role)) {
      next(new AppError('Forbidden', 403));
      return;
    }

    next();
  };
};
