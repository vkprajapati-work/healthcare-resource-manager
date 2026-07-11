import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { mapErrorToHttpResponse } from '../errors/error-mapper.js';
import { createErrorResponse } from '../shared/api-response.js';

const buildRequestContext = (req: Request) => ({
  requestId: req.id,
  method: req.method,
  path: req.originalUrl || req.url,
  userId: req.user?.id,
});

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const { statusCode, error: normalizedError } = mapErrorToHttpResponse(error);
  const requestContext = buildRequestContext(req);

  if (normalizedError.isOperational) {
    logger.warn('Application error', {
      ...requestContext,
      statusCode,
      errorName: normalizedError.name,
      errorCode: normalizedError.code,
      message: normalizedError.message,
    });
  } else {
    logger.error('Unhandled application error', {
      ...requestContext,
      statusCode,
      errorName: normalizedError.name,
      errorCode: normalizedError.code,
      message: normalizedError.message,
      stack: env.NODE_ENV !== 'production' ? normalizedError.stack : undefined,
    });
  }

  const response = createErrorResponse(
    normalizedError.message,
    normalizedError.code,
    normalizedError.details,
  );

  if (env.NODE_ENV !== 'production') {
    res.status(statusCode).json({
      ...response,
      requestId: req.id,
      error: {
        ...response.error,
        stack: normalizedError.stack?.split('\n').slice(0, 10) ?? [],
      },
    });
    return;
  }

  res.status(statusCode).json(response);
};
