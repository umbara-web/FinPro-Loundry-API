"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.getOrderById = exports.getAllOrders = void 0;
const prisma_1 = require("../lib/prisma");
const getAllOrders = async () => {
    return await prisma_1.prisma.order.findMany({
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
exports.getAllOrders = getAllOrders;
const getOrderById = async (id) => {
    return await prisma_1.prisma.order.findUnique({
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
exports.getOrderById = getOrderById;
const createOrder = async (data) => {
    return await prisma_1.prisma.order.create({
        data,
    });
};
exports.createOrder = createOrder;
const updateOrder = async (id, data) => {
    return await prisma_1.prisma.order.update({
        where: { id },
        data,
    });
};
exports.updateOrder = updateOrder;
const deleteOrder = async (id) => {
    return await prisma_1.prisma.order.delete({
        where: { id },
    });
};
exports.deleteOrder = deleteOrder;
