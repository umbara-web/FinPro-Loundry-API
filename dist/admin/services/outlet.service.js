"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOutlet = exports.updateOutlet = exports.createOutlet = exports.getOutletById = exports.getOutlets = void 0;
const prisma_1 = require("../lib/prisma");
const getOutlets = async () => {
    return await prisma_1.prisma.outlet.findMany({
        orderBy: { created_at: 'desc' },
    });
};
exports.getOutlets = getOutlets;
const getOutletById = async (id) => {
    return await prisma_1.prisma.outlet.findUnique({
        where: { id },
    });
};
exports.getOutletById = getOutletById;
const createOutlet = async (data) => {
    return await prisma_1.prisma.outlet.create({
        data,
    });
};
exports.createOutlet = createOutlet;
const updateOutlet = async (id, data) => {
    return await prisma_1.prisma.outlet.update({
        where: { id },
        data,
    });
};
exports.updateOutlet = updateOutlet;
const deleteOutlet = async (id) => {
    return await prisma_1.prisma.outlet.delete({
        where: { id },
    });
};
exports.deleteOutlet = deleteOutlet;
