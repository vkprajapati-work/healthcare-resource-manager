import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';

export const requestLogger = (req: Request, _res: Response, next: NextFunction): void => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  next();
};
