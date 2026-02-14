"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusService = exports.getHistoryService = exports.clockOutService = exports.clockInService = void 0;
const db_1 = __importDefault(require("../configs/db"));
const clockInService = async (staff_id) => {
    try {
        const staff = await db_1.default.staff.findFirst({
            where: { staff_id },
            include: { shift: true, outlet: true },
        });
        if (!staff)
            throw new Error("Staff profile not found");
        if (!staff.shift) {
            throw new Error("No shift assigned to this staff");
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await db_1.default.attendance.findFirst({
            where: {
                staff_id,
                check_in_at: {
                    gte: today,
                },
            },
        });
        if (existingAttendance) {
            throw new Error("Already clocked in today");
        }
        const currentShift = staff.shift;
        await db_1.default.attendance.create({
            data: {
                staff_id,
                outlet_id: staff.outlet_id,
                shift_id: currentShift.id,
                status: "PRESENT",
            },
        });
        return { message: "Clock in successful" };
    }
    catch (error) {
        throw error;
    }
};
exports.clockInService = clockInService;
const clockOutService = async (staff_id) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await db_1.default.attendance.findFirst({
            where: {
                staff_id,
                check_in_at: { gte: today },
                check_out_at: null,
            },
        });
        if (!attendance) {
            throw new Error("No active check-in found for today");
        }
        await db_1.default.attendance.update({
            where: { id: attendance.id },
            data: { check_out_at: new Date() },
        });
        return { message: "Clock out successful" };
    }
    catch (error) {
        throw error;
    }
};
exports.clockOutService = clockOutService;
const getHistoryService = async (staff_id) => {
    try {
        return await db_1.default.attendance.findMany({
            where: { staff_id },
            orderBy: { check_in_at: "desc" },
            take: 30,
            include: { outlet: true },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getHistoryService = getHistoryService;
const getStatusService = async (staff_id) => {
    var _a, _b, _c, _d;
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttendance = await db_1.default.attendance.findFirst({
            where: {
                staff_id,
                check_in_at: { gte: today },
            },
        });
        const staff = await db_1.default.staff.findFirst({
            where: { staff_id },
            include: { shift: true, outlet: true },
        });
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weeklyAttendance = await db_1.default.attendance.findMany({
            where: {
                staff_id,
                check_in_at: { gte: weekStart },
                check_out_at: { not: null },
            },
        });
        let weeklyHours = 0;
        for (const record of weeklyAttendance) {
            if (record.check_out_at && record.check_in_at) {
                const duration = record.check_out_at.getTime() - record.check_in_at.getTime();
                weeklyHours += duration / (1000 * 60 * 60);
            }
        }
        const isClockedIn = todayAttendance && !todayAttendance.check_out_at;
        const checkInTime = (todayAttendance === null || todayAttendance === void 0 ? void 0 : todayAttendance.check_in_at) || null;
        const checkOutTime = (todayAttendance === null || todayAttendance === void 0 ? void 0 : todayAttendance.check_out_at) || null;
        return {
            isClockedIn,
            checkInTime,
            checkOutTime,
            weeklyHours: Math.round(weeklyHours * 10) / 10,
            overtime: Math.max(0, Math.round((weeklyHours - 40) * 10) / 10),
            station: ((_a = staff === null || staff === void 0 ? void 0 : staff.outlet) === null || _a === void 0 ? void 0 : _a.name) || "Unknown",
            staffName: staff_id,
            lastShiftEnd: checkOutTime,
            shiftName: ((_b = staff === null || staff === void 0 ? void 0 : staff.shift) === null || _b === void 0 ? void 0 : _b.name) || "No Shift Assigned",
            shiftStart: ((_c = staff === null || staff === void 0 ? void 0 : staff.shift) === null || _c === void 0 ? void 0 : _c.start_time) || "--:--",
            shiftEnd: ((_d = staff === null || staff === void 0 ? void 0 : staff.shift) === null || _d === void 0 ? void 0 : _d.end_time) || "--:--",
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getStatusService = getStatusService;
