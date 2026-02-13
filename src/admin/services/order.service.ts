import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            pickup_request: {
                include: {
                    customer: true,
                    customer_address: true,
                },
            },
            outlet: true,
            outlet_admin: true,
            order_item: {
                include: {
                    laundry_item: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });
};

export const getOrderById = async (id: string) => {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            pickup_request: {
                include: {
                    customer: true,
                    customer_address: true,
                },
            },
            outlet: true,
            outlet_admin: true,
            order_item: {
                include: {
                    laundry_item: true,
                },
            },
        },
    });
};

export const createOrder = async (data: Prisma.OrderUncheckedCreateInput) => {


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
