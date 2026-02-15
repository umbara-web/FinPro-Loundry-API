"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const prisma_1 = require("../lib/prisma");
const getItems = async (search, category, status) => {
    const conditions = [];
    if (search) {
        conditions.push({
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { id: { contains: search, mode: 'insensitive' } },
            ],
        });
    }
    if (category && category !== 'Semua Kategori') {
        conditions.push({ category: category });
    }
    if (status && status !== 'Semua Status') {
        conditions.push({ status: status });
    }
    const where = conditions.length > 0 ? { AND: conditions } : {};
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
    return await prisma_1.prisma.$transaction(async (tx) => {
        // Delete related records first to avoid foreign key constraints
        await tx.station_Task_Item.deleteMany({ where: { laundry_item_id: id } });
        await tx.order_Item.deleteMany({ where: { laundry_item_id: id } });
        // Then delete the item itself
        return await tx.laundry_Item.delete({ where: { id } });
    });
};
exports.deleteItem = deleteItem;
