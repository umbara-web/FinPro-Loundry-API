"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorker = exports.updateWorker = exports.createWorker = exports.getWorkerById = exports.getWorkers = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getWorkers = async (params) => {
    const { page, limit, search, role, status, outletId } = params;
    const skip = (page - 1) * limit;
    const where = {
        AND: [
            search ? {
                OR: [
                    { staff: { name: { contains: search } } }, // Removed mode: 'insensitive' for now as it might depend on DB provider
                    { staff: { email: { contains: search } } },
                ]
            } : {},
            role && role !== 'Semua Role' ? {
                staff_type: role
            } : {},
            outletId ? {
                outlet_id: outletId
            } : {},
        ]
    };
    const [total, data] = await prisma_1.prisma.$transaction([
        prisma_1.prisma.staff.count({ where }),
        prisma_1.prisma.staff.findMany({
            where,
            skip,
            take: limit,
            include: {
                outlet: true,
                staff: true,
            },
            orderBy: { created_at: 'desc' },
        })
    ]);
    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};
exports.getWorkers = getWorkers;
const getWorkerById = async (id) => {
    return await prisma_1.prisma.staff.findUnique({
        where: { id },
        include: {
            outlet: true,
            staff: true,
        },
    });
};
exports.getWorkerById = getWorkerById;
const createWorker = async (data) => {
    const { name, email, phone, role, outletId } = data;
    const hashedPassword = await bcrypt_1.default.hash('password123', 10); // Default password
    return await prisma_1.prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'WORKER',
                phone,
                lat: '0',
                long: '0',
                isVerified: true,
                is_email_verified: true,
            },
        });
        const staff = await tx.staff.create({
            data: {
                staff_id: user.id,
                outlet_id: outletId,
                staff_type: role,
            },
            include: {
                staff: true,
                outlet: true,
            },
        });
        return staff;
    });
};
exports.createWorker = createWorker;
const updateWorker = async (id, data) => {
    const { name, email, phone, role, outletId } = data;
    return await prisma_1.prisma.$transaction(async (tx) => {
        const currentStaff = await tx.staff.findUnique({
            where: { id },
            select: { staff_id: true }
        });
        if (!currentStaff) {
            throw new Error('Staff not found');
        }
        if (name || email || phone || role) {
            await tx.user.update({
                where: { id: currentStaff.staff_id },
                data: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (email && { email })), (phone && { phone })), (role && { role: role })),
            });
        }
        const staffUpdateData = {};
        if (role)
            staffUpdateData.staff_type = role;
        if ('outletId' in data)
            staffUpdateData.outlet_id = outletId;
        if (Object.keys(staffUpdateData).length > 0) {
            return await tx.staff.update({
                where: { id },
                data: staffUpdateData,
                include: {
                    staff: true,
                    outlet: true
                }
            });
        }
        return await tx.staff.findUnique({
            where: { id },
            include: { outlet: true, staff: true }
        });
    });
};
exports.updateWorker = updateWorker;
const deleteWorker = async (id) => {
    return await prisma_1.prisma.staff.delete({
        where: { id },
    });
};
exports.deleteWorker = deleteWorker;
