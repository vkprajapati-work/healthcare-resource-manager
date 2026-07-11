/** Envelope shapes mirrored from docs/API_GUIDELINES.md §2–§3. */

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

export interface ApiPaginatedResponse<T, M extends PaginationMeta = PaginationMeta> {
  success: true;
  data: T;
  meta: M;
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorBody;
}

/** Normalized error thrown by the api client so callers get a typed error. */
export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details: ApiErrorDetail[];

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.details = body.details ?? [];
  }
}
