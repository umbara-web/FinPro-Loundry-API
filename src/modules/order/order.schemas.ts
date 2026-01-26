import { z } from 'zod';

export const getOrdersSchema = z.object({
  page: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Page must be a number',
    }),
  limit: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: 'Limit must be a number',
    }),
  sortBy: z.enum(['created_at', 'updated_at', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type GetOrdersQuery = z.infer<typeof getOrdersSchema>;
