import type { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { createErrorResponse } from '../shared/api-response.js';
import { AppError } from '../shared/errors.js';

const getErrorStatusCode = (error: unknown): number => {
  if (error instanceof AppError) {
    return error.statusCode;
  }

  if (error instanceof z.ZodError) {
    return 400;
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return 400;
  }

  if (error instanceof Error && ['JsonWebTokenError', 'TokenExpiredError'].includes(error.name)) {
    return 401;
  }

  if (error instanceof mongoose.Error.CastError) {
    return 400;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return 400;
  }

  if (error instanceof Error && error.name === 'MongoServerError') {
    return 409;
  }

  return 500;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof z.ZodError) {
    return 'Validation failed';
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return 'Invalid JSON payload';
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return 'Token expired';
  }

  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return 'Invalid token';
  }

  if (error instanceof mongoose.Error.CastError) {
    return 'Invalid resource identifier';
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return 'Validation failed';
  }

  if (error instanceof Error && error.name === 'MongoServerError') {
    return 'Resource conflict';
  }

  return env.NODE_ENV === 'production' ? 'Internal server error' : 'Unexpected server error';
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = getErrorStatusCode(error);
  const message = getErrorMessage(error);

  if (error instanceof AppError) {
    logger.warn('Application error handled', {
      statusCode: error.statusCode,
      message: error.message,
    });
  } else {
    logger.error('Unhandled error', { error });
  }

  const response = createErrorResponse(message);

  if (env.NODE_ENV !== 'production' && error instanceof Error) {
    res.status(statusCode).json({
      ...response,
      details: error.message,
      stack: error.stack?.split('\n').slice(0, 8) ?? [],
    });
    return;
  }

  res.status(statusCode).json(response);
};
