"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWorker = exports.updateWorker = exports.createWorker = exports.getWorkerById = exports.getWorkers = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const getWorkers = async () => {
    return await prisma_1.prisma.staff.findMany({
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
exports.getWorkers = getWorkers;
const getWorkerById = async (id) => {
    return await prisma_1.prisma.staff.findUnique({
        where: { id },
        include: {
            outlet: true,
            staff: true,
        },
    });
};
exports.getWorkerById = getWorkerById;
const createWorker = async (data) => {
    const { name, email, password, phone, outletId } = data, rest = __rest(data, ["name", "email", "password", "phone", "outletId"]);
    if (!outletId)
        throw new Error("Outlet ID is required");
    if (!email || !password || !name)
        throw new Error("Name, Email and Password are required");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    return await prisma_1.prisma.$transaction(async (tx) => {
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
exports.createWorker = createWorker;
const updateWorker = async (id, data) => {
    // separation of concerns: update user info vs staff info
    // For simplicity, we assume generic update might touch user fields
    // But modifying staff usually means changing outlet or user details
    // We first get the staff to find the user_id
    const existingStaff = await prisma_1.prisma.staff.findUnique({ where: { id } });
    if (!existingStaff)
        throw new Error("Worker not found");
    const { name, email, phone, outletId } = data;
    return await prisma_1.prisma.$transaction(async (tx) => {
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
exports.updateWorker = updateWorker;
const deleteWorker = async (id) => {
    // Delete staff record. User record might remain or be deleted depending on policy.
    // Usually we just delete the Staff role assignment.
    return await prisma_1.prisma.staff.delete({
        where: { id },
    });
};
exports.deleteWorker = deleteWorker;
