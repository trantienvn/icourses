import { z } from 'zod';

export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
