import { buildPaginationMeta, getSkip } from './pagination.js';

describe('getSkip', () => {
  it('returns 0 for the first page', () => {
    expect(getSkip({ page: 1, limit: 10 })).toBe(0);
  });

  it('offsets by (page - 1) * limit for later pages', () => {
    expect(getSkip({ page: 3, limit: 10 })).toBe(20);
    expect(getSkip({ page: 2, limit: 25 })).toBe(25);
  });
});

describe('buildPaginationMeta', () => {
  it('computes totalPages by rounding up', () => {
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 25)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 25,
      totalPages: 3,
    });
  });

  it('returns 0 pages for 0 items', () => {
    expect(buildPaginationMeta({ page: 1, limit: 10 }, 0)).toEqual({
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0,
    });
  });

  it('reflects the requested page and limit verbatim', () => {
    expect(buildPaginationMeta({ page: 4, limit: 5 }, 17)).toEqual({
      page: 4,
      limit: 5,
      totalItems: 17,
      totalPages: 4,
    });
  });
});
