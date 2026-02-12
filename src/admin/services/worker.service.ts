import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

export const getWorkers = async () => {
    return await prisma.staff.findMany({
        where: {
            staff_type: 'WORKER'
        },
        include: {
            outlet: true,
            staff: true, // Includes User details
        },
        orderBy: { created_at: 'desc' },
    });
};

export const getWorkerById = async (id: string) => {
    return await prisma.staff.findUnique({
        where: { id },
        include: {
            outlet: true,
            staff: true,
        },
    });
};

export const createWorker = async (data: any) => {
    const { name, email, password, phone, outletId, ...rest } = data;
    
    if (!outletId) throw new Error("Outlet ID is required");
    if (!email || !password || !name) throw new Error("Name, Email and Password are required");

    const hashedPassword = await bcrypt.hash(password, 10);

    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                phone,
                role: 'WORKER',
                lat: '0', 
                long: '0',
                // Add other user fields if strictly needed or allow permissive
            }
        });

        const staff = await tx.staff.create({
            data: {
                staff_id: user.id,
                outlet_id: outletId,
                staff_type: 'WORKER'
            },
            include: {
                outlet: true,
                staff: true
            }
        });

        return staff;
    });
};

export const updateWorker = async (id: string, data: any) => {
    // separation of concerns: update user info vs staff info
    // For simplicity, we assume generic update might touch user fields
    // But modifying staff usually means changing outlet or user details
    
    // We first get the staff to find the user_id
    const existingStaff = await prisma.staff.findUnique({ where: { id } });
    if (!existingStaff) throw new Error("Worker not found");

    const { name, email, phone, outletId } = data;

    return await prisma.$transaction(async (tx) => {
         // Update User
         if (name || email || phone) {
             await tx.user.update({
                 where: { id: existingStaff.staff_id },
                 data: { name, email, phone }
             });
         }

         // Update Staff (e.g. move outlet)
         if (outletId) {
             await tx.staff.update({
                 where: { id },
                 data: { outlet_id: outletId }
             });
         }
         
         return await tx.staff.findUnique({
             where: { id },
             include: { outlet: true, staff: true }
         });
    });
};

export const deleteWorker = async (id: string) => {
    // Delete staff record. User record might remain or be deleted depending on policy.
    // Usually we just delete the Staff role assignment.
    return await prisma.staff.delete({
        where: { id },
    });
};
