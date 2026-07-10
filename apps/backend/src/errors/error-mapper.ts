import mongoose from 'mongoose';
import { z } from 'zod';
import { env } from '../config/env.js';
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
  PayloadTooLargeError,
  RateLimitError,
  ValidationError,
} from './app-error.js';

interface ErrorLike {
  name?: string;
  message?: string;
  code?: number | string;
  statusCode?: number;
  status?: number;
  type?: string;
  details?: unknown;
  errors?: unknown;
  path?: string;
}

const normalizeZodDetails = (error: z.ZodError): Array<{ field?: string; message: string }> => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
};

export const mapErrorToHttpResponse = (error: unknown): { statusCode: number; error: AppError } => {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, error };
  }

  if (error instanceof z.ZodError) {
    return {
      statusCode: 400,
      error: new ValidationError('Validation failed', normalizeZodDetails(error)),
    };
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return { statusCode: 400, error: new BadRequestError('Malformed JSON payload') };
  }

  if (error instanceof Error && error.name === 'JsonWebTokenError') {
    return { statusCode: 401, error: new AuthenticationError('Invalid token') };
  }

  if (error instanceof Error && error.name === 'TokenExpiredError') {
    return { statusCode: 401, error: new AuthenticationError('Token expired') };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, error: new BadRequestError('Invalid resource identifier') };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return { statusCode: 400, error: new ValidationError('Validation failed') };
  }

  if (isMongoDuplicateKeyError(error)) {
    return { statusCode: 409, error: new ConflictError('Resource already exists') };
  }

  if (isMongoNetworkError(error)) {
    return { statusCode: 503, error: new InternalServerError('Database unavailable') };
  }

  if (isRateLimitError(error)) {
    return { statusCode: 429, error: new RateLimitError('Too many requests') };
  }

  if (isPayloadTooLargeError(error)) {
    return { statusCode: 413, error: new PayloadTooLargeError('Payload too large') };
  }

  if (isUnauthorizedError(error)) {
    return { statusCode: 401, error: new AuthenticationError('Authentication required') };
  }

  if (isForbiddenError(error)) {
    return { statusCode: 403, error: new AuthorizationError('Forbidden') };
  }

  if (isNotFoundError(error)) {
    return { statusCode: 404, error: new NotFoundError('Resource not found') };
  }

  if (env.NODE_ENV === 'production') {
    return { statusCode: 500, error: new InternalServerError('Internal server error') };
  }

  return {
    statusCode: 500,
    error: new InternalServerError(
      error instanceof Error ? error.message : 'Unexpected server error',
    ),
  };
};

const isMongoDuplicateKeyError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return candidate?.name === 'MongoServerError' && candidate?.code === 11000;
};

const isMongoNetworkError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return (
    candidate?.name === 'MongoServerError' &&
    (candidate?.code === 'ECONNREFUSED' || candidate?.code === 'ETIMEDOUT')
  );
};

const isRateLimitError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return (
    candidate?.statusCode === 429 || candidate?.status === 429 || candidate?.type === 'rate_limit'
  );
};

const isPayloadTooLargeError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return candidate?.statusCode === 413 || candidate?.status === 413;
};

const isUnauthorizedError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return candidate?.statusCode === 401 || candidate?.status === 401;
};

const isForbiddenError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return candidate?.statusCode === 403 || candidate?.status === 403;
};

const isNotFoundError = (error: unknown): boolean => {
  const candidate = error as ErrorLike;
  return candidate?.statusCode === 404 || candidate?.status === 404;
};
