import { z } from 'zod';

export const createPickupSchema = z.object({
  addressId: z.string().uuid(),
  schedulledPickupAt: z.string().datetime(), // Expect ISO string
  notes: z.string().optional(),
});
