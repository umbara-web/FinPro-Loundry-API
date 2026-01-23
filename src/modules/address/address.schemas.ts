import { z } from 'zod';

export const createAddressSchema = z.object({
  label: z.string().min(1, 'Label alamat wajib diisi'),
  recipientName: z.string().min(1, 'Nama penerima wajib diisi'),
  recipientPhone: z
    .string()
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^(\+62|62|0)[0-9]+$/, 'Format nomor telepon tidak valid'),
  fullAddress: z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
  city: z.string().min(1, 'Kecamatan/Kota wajib diisi'),
  postalCode: z.string().min(5, 'Kode pos minimal 5 digit'),
  notes: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  isPrimary: z.boolean(),
});

export const updateAddressSchema = createAddressSchema.partial();

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
