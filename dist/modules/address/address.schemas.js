"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = require("zod");
exports.createAddressSchema = zod_1.z.object({
    label: zod_1.z.string().min(1, 'Label alamat wajib diisi'),
    recipientName: zod_1.z.string().min(1, 'Nama penerima wajib diisi'),
    recipientPhone: zod_1.z
        .string()
        .min(10, 'Nomor telepon minimal 10 digit')
        .max(15, 'Nomor telepon maksimal 15 digit')
        .regex(/^(\+62|62|0)[0-9]+$/, 'Format nomor telepon tidak valid'),
    fullAddress: zod_1.z.string().min(10, 'Alamat lengkap minimal 10 karakter'),
    city: zod_1.z.string().min(1, 'Kecamatan/Kota wajib diisi'),
    postalCode: zod_1.z.string().min(5, 'Kode pos minimal 5 digit'),
    notes: zod_1.z.string().optional(),
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
    isPrimary: zod_1.z.boolean(),
});
exports.updateAddressSchema = exports.createAddressSchema.partial();
