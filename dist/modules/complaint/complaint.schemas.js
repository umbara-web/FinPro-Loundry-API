"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateComplaintStatusSchema = exports.getComplaintsSchema = exports.createComplaintSchema = void 0;
const zod_1 = require("zod");
exports.createComplaintSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid('Invalid order ID'),
    type: zod_1.z.enum(['DAMAGE', 'LOST', 'NOT_MATCH', 'REJECTED']),
    description: zod_1.z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description must be at most 1000 characters'),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.getComplaintsSchema = zod_1.z.object({
    page: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
    status: zod_1.z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'REJECTED']).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional(),
    search: zod_1.z.string().optional(),
});
exports.updateComplaintStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['IN_REVIEW', 'RESOLVED', 'REJECTED']),
});
