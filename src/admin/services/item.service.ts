import { prisma } from '../lib/prisma';
import { Prisma, ItemCategory, ItemUnit, ItemStatus } from '@prisma/client';

export const getItems = async (search?: string, category?: string, status?: string) => {
    const where: Prisma.Laundry_ItemWhereInput = {
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

    return await prisma.laundry_Item.findMany({
        where,
    });
};

export const getItemById = async (id: string) => {
    return await prisma.laundry_Item.findUnique({
        where: { id },
    });
};

export const createItem = async (data: Prisma.Laundry_ItemCreateInput) => {
    return await prisma.laundry_Item.create({
        data,
    });
};

export const updateItem = async (id: string, data: Prisma.Laundry_ItemUpdateInput) => {
    return await prisma.laundry_Item.update({
        where: { id },
        data,
    });
};

export const deleteItem = async (id: string) => {
    return await prisma.laundry_Item.delete({
        where: { id },
    });
};
