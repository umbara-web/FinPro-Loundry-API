import { z } from 'zod';

export const createComplaintSchema = z.object({
  orderId: z.string().uuid('Invalid order ID'),
  type: z.enum(['DAMAGE', 'LOST', 'NOT_MATCH', 'REJECTED']),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  images: z.array(z.string()).optional(),
});

export const getComplaintsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  search: z.string().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(['IN_REVIEW', 'RESOLVED', 'REJECTED']),
});

export type CreateComplaintBody = z.infer<typeof createComplaintSchema>;
export type GetComplaintsQuery = z.infer<typeof getComplaintsSchema>;
