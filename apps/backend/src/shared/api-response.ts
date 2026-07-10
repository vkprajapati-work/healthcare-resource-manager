export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: ErrorDetail[];
  error?: {
    code: string;
    details: ErrorDetail[];
  };
  requestId?: string | undefined;
}

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (
  message: string,
  errors: ErrorDetail[] = [],
  code = 'INTERNAL_SERVER_ERROR',
  requestId?: string,
): ApiErrorResponse => ({
  success: false,
  message,
  errors,
  error: {
    code,
    details: errors,
  },
  requestId,
});
