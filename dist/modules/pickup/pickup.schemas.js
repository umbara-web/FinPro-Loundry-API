"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPickupSchema = void 0;
const zod_1 = require("zod");
exports.createPickupSchema = zod_1.z.object({
    addressId: zod_1.z.string().uuid(),
    schedulledPickupAt: zod_1.z.string().datetime(), // Expect ISO string
    notes: zod_1.z.string().optional(),
    outletId: zod_1.z.string().optional(),
    items: zod_1.z
        .array(zod_1.z.object({
        laundryItemId: zod_1.z.string().uuid(),
        qty: zod_1.z.number().int().positive(),
    }))
        .optional(),
    manualItems: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string(),
        quantity: zod_1.z.number().int().positive(),
    }))
        .optional(),
});
