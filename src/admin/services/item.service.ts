import { prisma } from '../lib/prisma';
import { Prisma, ItemCategory, ItemUnit, ItemStatus } from '@prisma/client';

export const getItems = async (search?: string, category?: string, status?: string) => {
    const where: Prisma.LaundryItemWhereInput = {
        AND: [
            search ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { id: { contains: search, mode: 'insensitive' } },
                ]
            } : {},
            category && category !== 'Semua Kategori' ? { category: category as ItemCategory } : {},
            status && status !== 'Semua Status' ? { status: status as ItemStatus } : {},
        ],
    };

    return await prisma.laundryItem.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
};

export const getItemById = async (id: string) => {
    return await prisma.laundryItem.findUnique({
        where: { id },
    });
};

export const createItem = async (data: Prisma.LaundryItemCreateInput) => {
    // Generate custom ID (ITM-XXX) if not provided, or let database handle default ID
    // For now, we will use the default mechanism or a simple counter if needed
    // But since the frontend logic tried to generate ITM-XXX, we might want to respect that or rely on CUID from Prisma
    // To keep it simple and consistent with Prisma, we will let Prisma generate the ID (CUID)
    // Or if we want ITM-XXX, we need to query the last item. 
    // For this implementation, we'll accept the data as is.
    return await prisma.laundryItem.create({
        data,
    });
};

export const updateItem = async (id: string, data: Prisma.LaundryItemUpdateInput) => {
    return await prisma.laundryItem.update({
        where: { id },
        data,
    });
};

export const deleteItem = async (id: string) => {
    return await prisma.laundryItem.delete({
        where: { id },
    });
};
