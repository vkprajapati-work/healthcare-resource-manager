export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors: Array<{ field?: string; message: string }>;
  details?: string;
  stack?: string[];
}

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

export const createErrorResponse = (
  message: string,
  errors: Array<{ field?: string; message: string }> = [],
): ApiErrorResponse => ({
  success: false,
  message,
  errors,
});
