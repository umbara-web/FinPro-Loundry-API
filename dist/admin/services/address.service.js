"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getAddresses = void 0;
const prisma_1 = require("../lib/prisma");
const getAddresses = async (userId) => {
    const where = userId ? { customer_id: userId } : {};
    return await prisma_1.prisma.customer_Address.findMany({
        where,
        orderBy: { created_at: 'desc' },
    });
};
exports.getAddresses = getAddresses;
const getAddressById = async (id) => {
    return await prisma_1.prisma.customer_Address.findUnique({
        where: { id },
    });
};
exports.getAddressById = getAddressById;
const createAddress = async (data) => {
    // If this is set to primary, update others to false
    if (data.is_primary && data.customer_id) {
        await prisma_1.prisma.customer_Address.updateMany({
            where: { customer_id: data.customer_id },
            data: { is_primary: false },
        });
    }
    return await prisma_1.prisma.customer_Address.create({
        data,
    });
};
exports.createAddress = createAddress;
const updateAddress = async (id, data) => {
    if (data.is_primary === true && typeof data.customer_id === 'string') {
        await prisma_1.prisma.customer_Address.updateMany({
            where: { customer_id: data.customer_id, id: { not: id } },
            data: { is_primary: false },
        });
    }
    return await prisma_1.prisma.customer_Address.update({
        where: { id },
        data,
    });
};
exports.updateAddress = updateAddress;
const deleteAddress = async (id) => {
    return await prisma_1.prisma.customer_Address.delete({
        where: { id },
    });
};
exports.deleteAddress = deleteAddress;
