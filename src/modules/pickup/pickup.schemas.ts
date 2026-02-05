import { z } from 'zod';

export const createPickupSchema = z.object({
  addressId: z.string().uuid(),
  schedulledPickupAt: z.string().datetime(), // Expect ISO string
  notes: z.string().optional(),
  outletId: z.string().optional(),
  items: z
    .array(
      z.object({
        laundryItemId: z.string().uuid(),
        qty: z.number().int().positive(),
      })
    )
    .optional(),
  manualItems: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
});
