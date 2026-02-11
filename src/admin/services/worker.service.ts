import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getWorkers = async () => {
    return await prisma.worker.findMany({
        include: {
            outlet: true,
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getWorkerById = async (id: string) => {
    return await prisma.worker.findUnique({
        where: { id },
        include: {
            outlet: true,
        },
    });
};

export const createWorker = async (data: Prisma.WorkerUncheckedCreateInput) => {
    return await prisma.worker.create({
        data,
    });
};

export const updateWorker = async (id: string, data: Prisma.WorkerUncheckedUpdateInput) => {
    return await prisma.worker.update({
        where: { id },
        data,
    });
};

export const deleteWorker = async (id: string) => {
    return await prisma.worker.delete({
        where: { id },
    });
};
