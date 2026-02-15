import { prisma } from '../lib/prisma';
import { Prisma, Staff_Type } from '@prisma/client';
import bcrypt from 'bcrypt';

interface GetWorkersParams {
    page: number;
    limit: number;
    search?: string;
    role?: string;
    status?: string;
    outletId?: string;
}

export const getWorkers = async (params: GetWorkersParams) => {
    const { page, limit, search, role, status, outletId } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StaffWhereInput = {
        AND: [
            search ? {
                OR: [
                    { staff: { name: { contains: search } } }, // Removed mode: 'insensitive' for now as it might depend on DB provider
                    { staff: { email: { contains: search } } },
                ]
            } : {},
            role && role !== 'Semua Role' ? {
                staff_type: role as Staff_Type
            } : {},
            outletId ? {
                outlet_id: outletId
            } : {},
        ]
    };

    const [total, data] = await prisma.$transaction([
        prisma.staff.count({ where }),
        prisma.staff.findMany({
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

export const getWorkerById = async (id: string) => {
    return await prisma.staff.findUnique({
        where: { id },
        include: {
            outlet: true,
            staff: true,
        },
    });
};

export const createWorker = async (data: any) => {
    const { name, email, phone, role, outletId } = data;
    const hashedPassword = await bcrypt.hash('password123', 10); // Default password

    return await prisma.$transaction(async (tx) => {
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
                staff_type: role as Staff_Type,
            },
            include: {
                staff: true,
                outlet: true,
            },
        });

        return staff;
    });
};

export const updateWorker = async (id: string, data: any) => {
    const { name, email, phone, role, outletId } = data;

    return await prisma.$transaction(async (tx) => {

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
                data: {
                    ...(name && { name }),
                    ...(email && { email }),
                    ...(phone && { phone }),
                    ...(role && { role: role as any }),
                },
            });
        }

        const staffUpdateData: any = {};
        if (role) staffUpdateData.staff_type = role as Staff_Type;
        if ('outletId' in data) staffUpdateData.outlet_id = outletId;

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

export const deleteWorker = async (id: string) => {
    return await prisma.staff.delete({
        where: { id },
    });
};
