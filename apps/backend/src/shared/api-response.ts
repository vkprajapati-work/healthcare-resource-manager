export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<
  T,
  M extends PaginationMeta = PaginationMeta,
> extends ApiSuccessResponse<T> {
  meta: M;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

export const createSuccessResponse = <T>(data: T): ApiSuccessResponse<T> => ({
  success: true,
  data,
});

export const createPaginatedResponse = <T, M extends PaginationMeta>(
  data: T,
  meta: M,
): ApiPaginatedResponse<T, M> => ({
  success: true,
  data,
  meta,
});

export const createErrorResponse = (
  message: string,
  code: string,
  details: ErrorDetail[] = [],
): ApiErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details.length > 0 ? { details } : {}),
  },
});
