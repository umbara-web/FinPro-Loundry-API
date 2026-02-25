import { prisma } from '../lib/prisma';
import { Prisma, ItemCategory, ItemStatus } from '@prisma/client';

export const getItems = async (search?: string, category?: string, status?: string) => {
    const conditions: Prisma.Laundry_ItemWhereInput[] = [];

    if (search) {
        conditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (category && category !== 'Semua Kategori') {
        conditions.push({ category: category as ItemCategory });
    }
    if (status && status !== 'Semua Status') {
        conditions.push({ status: status as ItemStatus });
    }

    const where: Prisma.Laundry_ItemWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

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
    return await prisma.$transaction(async (tx) => {

        await tx.station_Task_Item.deleteMany({ where: { laundry_item_id: id } });
        await tx.order_Item.deleteMany({ where: { laundry_item_id: id } });

        return await tx.laundry_Item.delete({ where: { id } });
    });
};
