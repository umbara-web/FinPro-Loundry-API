"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const prisma_1 = require("../lib/prisma");
const getItems = async (search) => {
    const where = search ? {
        OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { id: { contains: search, mode: 'insensitive' } },
        ]
    } : {};
    return await prisma_1.prisma.laundry_Item.findMany({
        where,
    });
};
exports.getItems = getItems;
const getItemById = async (id) => {
    return await prisma_1.prisma.laundry_Item.findUnique({
        where: { id },
    });
};
exports.getItemById = getItemById;
const createItem = async (data) => {
    return await prisma_1.prisma.laundry_Item.create({
        data,
    });
};
exports.createItem = createItem;
const updateItem = async (id, data) => {
    return await prisma_1.prisma.laundry_Item.update({
        where: { id },
        data,
    });
};
exports.updateItem = updateItem;
const deleteItem = async (id) => {
    return await prisma_1.prisma.laundry_Item.delete({
        where: { id },
    });
};
exports.deleteItem = deleteItem;
