"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAttendanceReportService = void 0;
const db_1 = __importDefault(require("../configs/db"));
const client_1 = require("@prisma/client");
const getAttendanceReportService = async ({ outletId, startDate, endDate, staffType, }) => {
    // Build the where clause
    const whereClause = {
        outlet_id: outletId,
        check_in_at: {
            gte: startDate,
            lte: endDate,
        },
        // Only include Workers and Drivers via User -> Staff relation
        staff: {
            staff: {
                some: {
                    staff_type: {
                        in: staffType && staffType !== "ALL"
                            ? [staffType]
                            : [client_1.Staff_Type.WORKER, client_1.Staff_Type.DRIVER],
                    },
                    outlet_id: outletId,
                },
            },
        },
    };
    const attendanceRecords = await db_1.default.attendance.findMany({
        where: whereClause,
        include: {
            staff: {
                select: {
                    name: true,
                    role: true,
                    profile_picture_url: true,
                    staff: {
                        select: {
                            staff_type: true,
                        },
                        where: {
                            outlet_id: outletId,
                        },
                    },
                },
            },
            shift: true,
        },
        orderBy: {
            check_in_at: "desc",
        },
    });
    return attendanceRecords.map((record) => {
        var _a;
        let duration = 0;
        if (record.check_in_at && record.check_out_at) {
            const start = new Date(record.check_in_at).getTime();
            const end = new Date(record.check_out_at).getTime();
            duration = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
        }
        const staffTypeStr = ((_a = record.staff.staff[0]) === null || _a === void 0 ? void 0 : _a.staff_type) || record.staff.role;
        return {
            id: record.id,
            staffName: record.staff.name,
            staffAvatar: record.staff.profile_picture_url,
            staffRole: staffTypeStr,
            date: record.check_in_at,
            shiftName: record.shift.name,
            clockIn: record.check_in_at,
            clockOut: record.check_out_at,
            duration: duration,
            status: record.status,
            notes: record.notes,
        };
    });
};
exports.getAttendanceReportService = getAttendanceReportService;
