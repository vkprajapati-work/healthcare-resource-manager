import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { mapErrorToHttpResponse } from '../errors/error-mapper.js';
import { createErrorResponse } from '../shared/api-response.js';

const getRequestContext = (req: Request) => ({
  method: req.method,
  path: req.originalUrl || req.url,
  requestId: req.get('x-request-id') ?? undefined,
  userId: req.user?.id,
});

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const { statusCode, error: normalizedError } = mapErrorToHttpResponse(error);

  if (normalizedError.isOperational) {
    logger.warn('Application error', {
      ...getRequestContext(req),
      statusCode,
      errorName: normalizedError.name,
      errorCode: normalizedError.code,
      message: normalizedError.message,
    });
  } else {
    logger.error('Unhandled application error', {
      ...getRequestContext(req),
      statusCode,
      errorName: normalizedError.name,
      errorCode: normalizedError.code,
      message: normalizedError.message,
      stack: env.NODE_ENV !== 'production' ? normalizedError.stack : undefined,
    });
  }

  const responsePayload = {
    success: false,
    message: normalizedError.message,
    error: {
      code: normalizedError.code,
      details: env.NODE_ENV !== 'production' ? normalizedError.details : [],
    },
  };

  if (env.NODE_ENV !== 'production' && error instanceof Error) {
    res.status(statusCode).json({
      ...responsePayload,
      debug: {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 10) ?? [],
        method: req.method,
        path: req.originalUrl || req.url,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  res.status(statusCode).json(createErrorResponse(normalizedError.message, []));
};
