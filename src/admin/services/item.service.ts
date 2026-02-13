import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getItems = async (search?: string) => {
    const where: Prisma.Laundry_ItemWhereInput = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } },
        ]
    } : {};

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
