import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getOutlets = async () => {
    return await prisma.outlet.findMany({
        orderBy: { created_at: 'desc' },
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
    // Hard delete: cascade remove all related records, then the outlet
    return await prisma.$transaction(async (tx) => {
        // 1. Find all orders for this outlet
        const orders = await tx.order.findMany({
            where: { outlet_id: id },
            select: { id: true }
        });
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            // 2a. Find station tasks for those orders
            const stationTasks = await tx.station_Task.findMany({
                where: { order_id: { in: orderIds } },
                select: { id: true }
            });
            const stationTaskIds = stationTasks.map(st => st.id);

            // 2b. Delete station task children
            if (stationTaskIds.length > 0) {
                await tx.station_Task_Item.deleteMany({ where: { station_task_id: { in: stationTaskIds } } });
                await tx.bypass_Request.deleteMany({ where: { station_task_id: { in: stationTaskIds } } });
            }

            // 2c. Find complaints to delete their messages first
            const complaints = await tx.complaint.findMany({
                where: { order_id: { in: orderIds } },
                select: { id: true }
            });
            const complaintIds = complaints.map(c => c.id);
            if (complaintIds.length > 0) {
                await tx.complaintMessage.deleteMany({ where: { complaint_id: { in: complaintIds } } });
            }

            // 2d. Delete order children
            await tx.station_Task.deleteMany({ where: { order_id: { in: orderIds } } });
            await tx.complaint.deleteMany({ where: { order_id: { in: orderIds } } });
            await tx.notification.deleteMany({ where: { order_id: { in: orderIds } } });
            await tx.driver_Task.deleteMany({ where: { order_id: { in: orderIds } } });
            await tx.payment.deleteMany({ where: { order_id: { in: orderIds } } });
            await tx.order_Item.deleteMany({ where: { order_id: { in: orderIds } } });
        }

        // 3. Delete direct outlet children
        await tx.order.deleteMany({ where: { outlet_id: id } });
        await tx.attendance.deleteMany({ where: { outlet_id: id } });
        await tx.pickup_Request.deleteMany({ where: { assigned_outlet_id: id } });
        await tx.staff.deleteMany({ where: { outlet_id: id } });
        await tx.shift.deleteMany({ where: { outlet_id: id } });

        // 4. Finally delete the outlet
        return await tx.outlet.delete({ where: { id } });
    });
};