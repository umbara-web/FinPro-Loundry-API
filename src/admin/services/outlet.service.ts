import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getOutlets = async () => {
    return await prisma.outlet.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

export const getOutletById = async (id: string) => {
    return await prisma.outlet.findUnique({
        where: { id },
    });
};

export const createOutlet = async (data: Prisma.OutletCreateInput) => {
    return await prisma.outlet.create({
        data,
    });
};

export const updateOutlet = async (id: string, data: Prisma.OutletUpdateInput) => {
    return await prisma.outlet.update({
        where: { id },
        data,
    });
};

export const deleteOutlet = async (id: string) => {
    return await prisma.outlet.delete({
        where: { id },
    });
};
