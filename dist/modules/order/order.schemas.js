"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersSchema = void 0;
const zod_1 = require("zod");
exports.getOrdersSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: 'Page must be a number',
    }),
    limit: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: 'Limit must be a number',
    }),
    sortBy: zod_1.z.enum(['created_at', 'updated_at', 'status']).optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
});
