import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            user: true,
            outlet: true,
            address: true,
            items: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getOrderById = async (id: string) => {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
            outlet: true,
            address: true,
            items: true,
        },
    });
};

export const createOrder = async (data: Prisma.OrderUncheckedCreateInput) => {
    // Generate invoiceId if not provided (simple logic: INV-Date-Random)
    if (!data.invoiceId) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        data.invoiceId = `INV-${date}-${random}`;
    }

    return await prisma.order.create({
        data,
    });
};

export const updateOrder = async (id: string, data: Prisma.OrderUncheckedUpdateInput) => {
    return await prisma.order.update({
        where: { id },
        data,
    });
};

export const deleteOrder = async (id: string) => {
    return await prisma.order.delete({
        where: { id },
    });
};
