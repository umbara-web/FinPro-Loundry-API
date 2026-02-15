import prisma from '../configs/db';
import { Staff_Type } from '@prisma/client';

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
              staffType && staffType !== 'ALL'
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
      check_in_at: 'desc',
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

export const getBypassRequestsService = async (outletId: string) => {
  try {
    const requests = await prisma.bypass_Request.findMany({
      where: {
        station_task: {
          order: {
            outlet_id: outletId,
          },
        },
        status: 'PENDING',
      },
      include: {
        station_task: {
          include: {
            worker: {
              select: {
                name: true,
                profile_picture_url: true,
              },
            },
            station_task_item: {
              include: {
                laundry_item: true,
              },
            },
            order: {
              include: {
                order_item: {
                  include: {
                    laundry_item: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        station_task: {
          started_at: 'desc',
        },
      },
    });

    return requests.map((req) => ({
      id: req.id,
      taskId: req.station_task_id,
      workerName: req.station_task.worker?.name || 'Unknown',
      workerAvatar: req.station_task.worker?.profile_picture_url,
      station: req.station_task.task_type,
      reason: req.reason,
      createdAt: req.station_task.started_at, // Approximate timestamp
      items: req.station_task.station_task_item.map((item) => ({
        id: item.laundry_item_id,
        name: item.laundry_item.name,
        qty: item.qty,
        expectedQty:
          req.station_task.order.order_item.find(
            (oi) => oi.laundry_item_id === item.laundry_item_id
          )?.qty || 0,
      })),
    }));
  } catch (error) {
    throw error;
  }
};

export const handleBypassRequestService = async (
  requestId: string,
  action: 'APPROVE' | 'REJECT',
  adminId: string
) => {
  try {
    const request = await prisma.bypass_Request.findUnique({
      where: { id: requestId },
      include: {
        station_task: {
          include: {
            station_task_item: true,
            order: {
              include: {
                payment: true,
              },
            },
          },
        },
      },
    });

    if (!request) throw new Error('Bypass request not found');
    if (request.status !== 'PENDING')
      throw new Error('Request already handled');

    if (action === 'REJECT') {
      await prisma.bypass_Request.update({
        where: { id: requestId },
        data: {
          status: 'REJECTED',
          outlet_admin_id: adminId,
        },
      });
      return { message: 'Bypass request rejected' };
    }

    // APPROVE LOGIC
    await prisma.$transaction(async (tx) => {
      // 1. Approve Request
      await tx.bypass_Request.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          approved_at: new Date(),
          outlet_admin_id: adminId,
        },
      });

      // 2. Complete the Task (Logic duplicated from worker.service.ts completeTaskTransaction)
      const task = request.station_task;

      await tx.station_Task.update({
        where: { id: task.id },
        data: {
          status: 'COMPLETED',
          finished_at: new Date(),
        },
      });

      // 3. Create next task
      let nextStationType = null;
      if (task.task_type === 'WASHING') nextStationType = 'IRONING';
      else if (task.task_type === 'IRONING') nextStationType = 'PACKING';

      if (nextStationType) {
        await tx.station_Task.create({
          data: {
            order_id: task.order_id,
            task_type: nextStationType as any,
            worker_id: null,
            status: 'PENDING',
          },
        });
      } else {
        if (task.task_type === 'PACKING') {
          const order = task.order;

          const isPaid =
            order?.status === 'PAID' ||
            order?.paid_at != null ||
            order?.payment?.some((p: any) => p.status === 'PAID');

          const newStatus = isPaid ? 'READY_FOR_DELIVERY' : 'WAITING_PAYMENT';

          await tx.order.update({
            where: { id: task.order_id },
            data: { status: newStatus },
          });

          if (newStatus === 'READY_FOR_DELIVERY') {
            await tx.driver_Task.create({
              data: {
                order_id: task.order_id,
                task_type: 'DELIVERY',
                status: 'AVAILABLE',
              },
            });
          }
        }
      }
    });

    return { message: 'Bypass request approved and task progressed' };
  } catch (error) {
    throw error;
  }
};
