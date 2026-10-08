import { describe, expect, it } from 'vitest';
import { paginationSchema } from './index.js';

describe('paginationSchema', () => {
  it('uses safe defaults and caps page size at 100', () => {
    expect(paginationSchema.parse({})).toEqual({ page: 1, limit: 20 });
    expect(paginationSchema.parse({ page: '2', limit: '100' })).toEqual({ page: 2, limit: 100 });
    expect(paginationSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(paginationSchema.safeParse({ limit: 101 }).success).toBe(false);
  });
});
