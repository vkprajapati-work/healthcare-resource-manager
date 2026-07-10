import type { PaginationMeta } from '../shared/api-response.js';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const getSkip = ({ page, limit }: PaginationParams): number => (page - 1) * limit;

export const buildPaginationMeta = (
  { page, limit }: PaginationParams,
  totalItems: number,
): PaginationMeta => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});
