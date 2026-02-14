import prisma from '../configs/db';
import { createCustomError } from '../common/utils/customError';

const hasActiveJob = async (driver_id: string): Promise<boolean> => {
  try {
    const activePickup = await prisma.pickup_Request.findFirst({
      where: {
        assigned_driver_id: driver_id,
        status: {
          in: ['DRIVER_ASSIGNED', 'PICKED_UP'],
        },
      },
    });

    if (activePickup) return true;

    const activeDelivery = await prisma.driver_Task.findFirst({
      where: {
        driver_id: driver_id,
        status: {
          in: ['ACCEPTED', 'IN_PROGRESS'],
        },
      },
    });

    return !!activeDelivery;
  } catch (error) {
    throw error;
  }
};

export const getActiveJobService = async (driver_id: string) => {
  try {
    const [activePickup, activeDelivery] = await Promise.all([
      prisma.pickup_Request.findFirst({
        where: {
          assigned_driver_id: driver_id,
          status: {
            in: ['DRIVER_ASSIGNED', 'PICKED_UP'],
          },
        },
        include: {
          customer: { select: { name: true, phone: true } },
          customer_address: true,
        },
      }),
      prisma.driver_Task.findFirst({
        where: {
          driver_id: driver_id,
          status: {
            in: ['ACCEPTED', 'IN_PROGRESS'],
          },
        },
        include: {
          order: {
            include: {
              pickup_request: {
                include: {
                  customer: { select: { name: true, phone: true } },
                  customer_address: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (activePickup) {
      return {
        type: 'PICKUP',
        data: activePickup,
      };
    }

    if (activeDelivery) {
      return {
        type: 'DELIVERY',
        data: activeDelivery,
      };
    }

    return null;
  } catch (error) {
    throw error;
  }
};

export const getDriverHistoryService = async (
  driver_id: string,
  page: number = 1,
  limit: number = 10,
  date?: string
) => {
  try {
    const skip = (page - 1) * limit;
    const fetchLimit = skip + limit;

    let dateFilter: { gte: Date; lt: Date } | undefined;
    if (date === 'today') {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const endOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
      );
      dateFilter = { gte: startOfDay, lt: endOfDay };
    }

    const [completedPickups, completedDeliveries] = await Promise.all([
      prisma.pickup_Request.findMany({
        where: {
          assigned_driver_id: driver_id,
          status: 'ARRIVED_OUTLET',
          ...(dateFilter ? { updated_at: dateFilter } : {}),
        },
        include: {
          customer: { select: { name: true } },
          customer_address: { select: { address: true } },
          order: { select: { id: true } },
        },
        orderBy: { updated_at: 'desc' },
        take: fetchLimit,
      }),
      prisma.driver_Task.findMany({
        where: {
          driver_id: driver_id,
          status: 'DONE',
          ...(dateFilter ? { finished_at: dateFilter } : {}),
        },
        include: {
          order: {
            include: {
              pickup_request: {
                include: {
                  customer: { select: { name: true } },
                  customer_address: { select: { address: true } },
                },
              },
            },
          },
        },
        orderBy: { finished_at: 'desc' },
        take: fetchLimit,
      }),
    ]);

    const history = [
      ...completedPickups.map((p) => ({
        id: p.id,
        type: 'PICKUP' as const,
        order_number: p.order[0]?.id
          ? `ORD-${p.order[0].id.slice(-4).toUpperCase()}`
          : `PKP-${p.id.slice(-4).toUpperCase()}`,
        customer_name: p.customer?.name || 'N/A',
        address: p.customer_address?.address || 'N/A',
        completed_at: p.updated_at,
        status: 'SELESAI',
      })),
      ...completedDeliveries.map((d) => ({
        id: d.id,
        type: 'DELIVERY' as const,
        order_number: `ORD-${d.order_id.slice(-4).toUpperCase()}`,
        customer_name: d.order?.pickup_request?.customer?.name || 'N/A',
        address: d.order?.pickup_request?.customer_address?.address || 'N/A',
        completed_at: d.finished_at || d.order.updated_at,
        status: 'SELESAI',
      })),
    ].sort(
      (a, b) =>
        new Date(b.completed_at!).getTime() -
        new Date(a.completed_at!).getTime()
    );

    const [totalPickups, totalDeliveries] = await Promise.all([
      prisma.pickup_Request.count({
        where: {
          assigned_driver_id: driver_id,
          status: 'ARRIVED_OUTLET',
          ...(dateFilter ? { updated_at: dateFilter } : {}),
        },
      }),
      prisma.driver_Task.count({
        where: {
          driver_id: driver_id,
          status: 'DONE',
          ...(dateFilter ? { finished_at: dateFilter } : {}),
        },
      }),
    ]);

    const total = totalPickups + totalDeliveries;

    const paginatedHistory = history.slice(skip, skip + limit);

    return {
      data: paginatedHistory,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

export const getAvailablePickupsService = async (driver_id: string) => {
  try {
    const driver = await prisma.staff.findUnique({
      where: { staff_id: driver_id },
      include: { outlet: true },
    });

    if (!driver) throw new Error('Driver profile not found');

    return await prisma.pickup_Request.findMany({
      where: {
        assigned_outlet_id: driver.outlet_id,
        status: 'WAITING_DRIVER',
        assigned_driver_id: null,
      },
      include: {
        customer: { select: { name: true, phone: true } },
        customer_address: true,
      },
    });
  } catch (error) {
    throw error;
  }
};

// Get single pickup by ID
export const getPickupByIdService = async (
  driver_id: string,
  pickupId: string
) => {
  try {
    const driver = await prisma.staff.findUnique({
      where: { staff_id: driver_id },
    });

    const pickup = await prisma.pickup_Request.findFirst({
      where: {
        id: pickupId,
        OR: [
          { assigned_driver_id: driver_id },
          { status: 'WAITING_DRIVER', assigned_outlet_id: driver?.outlet_id },
        ],
      },
      include: {
        customer: { select: { name: true, phone: true } },
        customer_address: true,
        outlet: true,
      },
    });

    if (!pickup)
      throw createCustomError(
        404,
        'Pickup tidak ditemukan atau bukan milik Anda'
      );

    return pickup;
  } catch (error) {
    throw error;
  }
};

export const acceptPickupService = async (
  driver_id: string,
  requestId: string
) => {
  try {
    if (await hasActiveJob(driver_id)) {
      throw createCustomError(
        400,
        'Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.'
      );
    }

    await prisma.pickup_Request.update({
      where: { id: requestId },
      data: {
        assigned_driver_id: driver_id,
        status: 'DRIVER_ASSIGNED',
      },
    });

    return { message: 'Pickup accepted' };
  } catch (error) {
    throw error;
  }
};

export const updatePickupStatusService = async (
  requestId: string,
  status: any
) => {
  try {
    await prisma.pickup_Request.update({
      where: { id: requestId },
      data: { status },
    });
    return { message: 'Status updated' };
  } catch (error) {
    throw error;
  }
};

export const getAvailableDeliveriesService = async (driver_id: string) => {
  try {
    const driver = await prisma.staff.findUnique({
      where: { staff_id: driver_id },
    });

    if (!driver) throw new Error('Driver profile not found');

    return await prisma.order.findMany({
      where: {
        outlet_id: driver.outlet_id,
        status: 'READY_FOR_DELIVERY',
      },
      include: {
        pickup_request: {
          include: { customer_address: true, customer: true },
        },
      },
    });
  } catch (error) {
    throw error;
  }
};

export const acceptDeliveryService = async (
  driver_id: string,
  orderId: string
) => {
  try {
    if (await hasActiveJob(driver_id)) {
      throw createCustomError(
        400,
        'Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.'
      );
    }

    const task = await prisma.$transaction(async (tx: any) => {
      const existingTask = await tx.driver_Task.findFirst({
        where: {
          order_id: orderId,
          task_type: 'DELIVERY',
          status: 'AVAILABLE',
        },
      });

      let newTask;
      if (existingTask) {
        newTask = await tx.driver_Task.update({
          where: { id: existingTask.id },
          data: {
            driver_id: driver_id,
            status: 'ACCEPTED',
            started_at: new Date(),
          },
        });
      } else {
        newTask = await tx.driver_Task.create({
          data: {
            driver_id: driver_id,
            order_id: orderId,
            task_type: 'DELIVERY',
            status: 'ACCEPTED',
          },
        });
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'ON_DELIVERY' },
      });

      return newTask;
    });

    return { message: 'Delivery accepted', data: task };
  } catch (error) {
    throw error;
  }
};

// Get single delivery task by ID
export const getDeliveryByIdService = async (
  driver_id: string,
  taskId: string
) => {
  try {
    const task = await prisma.driver_Task.findFirst({
      where: {
        id: taskId,
        driver_id: driver_id,
      },
      include: {
        order: {
          include: {
            pickup_request: {
              include: {
                customer: { select: { name: true, phone: true } },
                customer_address: true,
                outlet: {
                  select: { name: true, address: true, lat: true, long: true },
                },
              },
            },
          },
        },
      },
    });

    if (!task)
      throw createCustomError(
        404,
        'Delivery task tidak ditemukan atau bukan milik Anda'
      );

    return task;
  } catch (error) {
    throw error;
  }
};

export const updateDeliveryStatusService = async (
  taskId: string,
  status: any
) => {
  try {
    await prisma.driver_Task.update({
      where: { id: taskId },
      data: { status, finished_at: status === 'DONE' ? new Date() : null },
    });

    if (status === 'DONE') {
      const task = await prisma.driver_Task.findUnique({
        where: { id: taskId },
      });
      if (task) {
        await prisma.order.update({
          where: { id: task.order_id },
          data: { status: 'DELIVERED' },
        });
      }
    }

    return { message: 'Delivery status updated' };
  } catch (error) {
    throw error;
  }
};
