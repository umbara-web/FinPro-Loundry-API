import prisma from "../lib/prisma";

export const clockInService = async (staff_id: string) => {
  const staff = await prisma.staff.findFirst({
    where: { staff_id },
    include: { shift: true, outlet: true },
  });

  if (!staff) throw new Error("Staff profile not found");
  if (!staff.shift || staff.shift.length === 0) {
    throw new Error("No shift assigned to this staff");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttendance = await prisma.attendance.findFirst({
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

  const currentShift = staff.shift[0]; 

  await prisma.attendance.create({
    data: {
      staff_id,
      outlet_id: staff.outlet_id,
      shift_id: currentShift.id,
      status: "PRESENT",
    },
  });

  return { message: "Clock in successful" };
};

export const clockOutService = async (staff_id: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.findFirst({
    where: {
      staff_id,
      check_in_at: { gte: today },
      check_out_at: null
    }
  });

  if (!attendance) {
    throw new Error("No active check-in found for today");
  }

  await prisma.attendance.update({
    where: { id: attendance.id },
    data: { check_out_at: new Date() }
  });

  return { message: "Clock out successful" };
};

export const getHistoryService = async (staff_id: string) => {
  return await prisma.attendance.findMany({
    where: { staff_id },
    orderBy: { check_in_at: 'desc' },
    take: 30 
  });
};
