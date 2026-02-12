import prisma from "../configs/db";
import { Staff_Type } from "@prisma/client";

interface AttendanceReportParams {
  outletId: string;
  startDate: Date;
  endDate: Date;
  staffType?: string;
}

export const getAttendanceReportService = async ({
  outletId,
  startDate,
  endDate,
  staffType,
}: AttendanceReportParams) => {
  // Build the where clause
  const whereClause: any = {
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
            in:
              staffType && staffType !== "ALL"
                ? [staffType as Staff_Type]
                : [Staff_Type.WORKER, Staff_Type.DRIVER],
          },
          outlet_id: outletId,
        },
      },
    },
  };

  const attendanceRecords = await prisma.attendance.findMany({
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
    let duration = 0;
    if (record.check_in_at && record.check_out_at) {
      const start = new Date(record.check_in_at).getTime();
      const end = new Date(record.check_out_at).getTime();
      duration = Math.round(((end - start) / (1000 * 60 * 60)) * 10) / 10;
    }

    const staffTypeStr = record.staff.staff[0]?.staff_type || record.staff.role;

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
