import prisma from "../configs/db";
import { createCustomError } from "../common/utils/customError";

// Helper: Check if driver has an active job
const hasActiveJob = async (driver_id: string): Promise<boolean> => {
  // Check for active pickup (assigned but not arrived at outlet)
  const activePickup = await prisma.pickup_Request.findFirst({
    where: {
      assigned_driver_id: driver_id,
      status: {
        in: ["DRIVER_ASSIGNED", "PICKED_UP"]
      }
    }
  });
  
  if (activePickup) return true;

  // Check for active delivery task
  const activeDelivery = await prisma.driver_Task.findFirst({
    where: {
      driver_id: driver_id,
      status: {
        in: ["ACCEPTED", "IN_PROGRESS"]
      }
    }
  });

  return !!activeDelivery;
};

// Get driver's current active job (pickup or delivery)
export const getActiveJobService = async (driver_id: string) => {
  // Check for active pickup first
  const activePickup = await prisma.pickup_Request.findFirst({
    where: {
      assigned_driver_id: driver_id,
      status: {
        in: ["DRIVER_ASSIGNED", "PICKED_UP"]
      }
    },
    include: {
      customer: { select: { name: true, phone: true } },
      customer_address: true
    }
  });

  if (activePickup) {
    return {
      type: "PICKUP",
      data: activePickup
    };
  }

  // Check for active delivery
  const activeDelivery = await prisma.driver_Task.findFirst({
    where: {
      driver_id: driver_id,
      status: {
        in: ["ACCEPTED", "IN_PROGRESS"]
      }
    },
    include: {
      order: {
        include: {
          pickup_request: {
            include: {
              customer: { select: { name: true, phone: true } },
              customer_address: true
            }
          }
        }
      }
    }
  });

  if (activeDelivery) {
    return {
      type: "DELIVERY",
      data: activeDelivery
    };
  }

  return null;
};

// Get driver's job history
export const getDriverHistoryService = async (driver_id: string, page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  // Get completed pickups
  const completedPickups = await prisma.pickup_Request.findMany({
    where: {
      assigned_driver_id: driver_id,
      status: "ARRIVED_OUTLET"
    },
    include: {
      customer: { select: { name: true } },
      customer_address: { select: { address: true } },
      order: { select: { id: true } }
    },
    orderBy: { updated_at: "desc" }
  });

  // Get completed deliveries
  const completedDeliveries = await prisma.driver_Task.findMany({
    where: {
      driver_id: driver_id,
      status: "DONE"
    },
    include: {
      order: {
        include: {
          pickup_request: {
            include: {
              customer: { select: { name: true } },
              customer_address: { select: { address: true } }
            }
          }
        }
      }
    },
    orderBy: { finished_at: "desc" }
  });

  // Combine and format
  const history = [
    ...completedPickups.map(p => ({
      id: p.id,
      type: "PICKUP" as const,
      order_number: p.order[0]?.id ? `ORD-${p.order[0].id.slice(-4).toUpperCase()}` : `PKP-${p.id.slice(-4).toUpperCase()}`,
      customer_name: p.customer?.name || "N/A",
      address: p.customer_address?.address || "N/A",
      completed_at: p.updated_at,
      status: "SELESAI"
    })),
    ...completedDeliveries.map(d => ({
      id: d.id,
      type: "DELIVERY" as const,
      order_number: `ORD-${d.order_id.slice(-4).toUpperCase()}`,
      customer_name: d.order?.pickup_request?.customer?.name || "N/A",
      address: d.order?.pickup_request?.customer_address?.address || "N/A",
      completed_at: d.finished_at,
      status: "SELESAI"
    }))
  ].sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  const total = history.length;
  const paginatedHistory = history.slice(skip, skip + limit);

  return {
    data: paginatedHistory,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const getAvailablePickupsService = async (driver_id: string) => {
  const driver = await prisma.staff.findUnique({
      where: { staff_id: driver_id },
      include: { outlet: true }
  });

  if (!driver) throw new Error("Driver profile not found");

  return await prisma.pickup_Request.findMany({
    where: {
      assigned_outlet_id: driver.outlet_id,
      status: "WAITING_DRIVER",
      assigned_driver_id: null,
    },
    include: {
        customer: { select: { name: true, phone: true } },
        customer_address: true
    }
  });
};

// Get single pickup by ID (for driver assigned to it)
export const getPickupByIdService = async (driver_id: string, pickupId: string) => {
  const pickup = await prisma.pickup_Request.findFirst({
    where: {
      id: pickupId,
      assigned_driver_id: driver_id
    },
    include: {
      customer: { select: { name: true, phone: true } },
      customer_address: true
    }
  });

  if (!pickup) throw createCustomError(404, "Pickup tidak ditemukan atau bukan milik Anda");
  
  return pickup;
};

export const acceptPickupService = async (driver_id: string, requestId: string) => {
  // Check if driver already has an active job
  if (await hasActiveJob(driver_id)) {
    throw createCustomError(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
  }

  await prisma.pickup_Request.update({
    where: { id: requestId },
    data: {
      assigned_driver_id: driver_id,
      status: "DRIVER_ASSIGNED"
    }
  });

  return { message: "Pickup accepted" };
};

export const updatePickupStatusService = async (requestId: string, status: any) => {
   await prisma.pickup_Request.update({
       where: { id: requestId },
       data: { status }
   });
   return { message: "Status updated" };
};

export const getAvailableDeliveriesService = async (driver_id: string) => {
    const driver = await prisma.staff.findUnique({
        where: { staff_id: driver_id },
    });

    if (!driver) throw new Error("Driver profile not found");

    return await prisma.order.findMany({
        where: {
            outlet_id: driver.outlet_id,
            status: "READY_FOR_DELIVERY"
        },
        include: {
            pickup_request: {
                include: { customer_address: true, customer: true }
            }
        }
    });
};

export const acceptDeliveryService = async (driver_id: string, orderId: string) => {
    // Check if driver already has an active job
    if (await hasActiveJob(driver_id)) {
        throw createCustomError(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
    }

    const task = await prisma.$transaction(async (tx: any) => {
        const newTask = await tx.driver_Task.create({
            data: {
                driver_id: driver_id,
                order_id: orderId,
                task_type: "DELIVERY",
                status: "ACCEPTED"
            }
        });

        await tx.order.update({
            where: { id: orderId },
            data: { status: "ON_DELIVERY" }
        });

        return newTask;
    });

    return { message: "Delivery accepted", data: task };
};

// Get single delivery task by ID (for driver assigned to it)
export const getDeliveryByIdService = async (driver_id: string, taskId: string) => {
  const task = await prisma.driver_Task.findFirst({
    where: {
      id: taskId,
      driver_id: driver_id
    },
    include: {
      order: {
        include: {
          pickup_request: {
            include: {
              customer: { select: { name: true, phone: true } },
              customer_address: true
            }
          }
        }
      }
    }
  });

  if (!task) throw createCustomError(404, "Delivery task tidak ditemukan atau bukan milik Anda");

  return task;
};

export const updateDeliveryStatusService = async (taskId: string, status: any) => {
    await prisma.driver_Task.update({
        where: { id: taskId },
        data: { status, finished_at: status === 'DONE' ? new Date() : null }
    });
    
    if (status === 'DONE') {
       const task = await prisma.driver_Task.findUnique({where: {id: taskId}});
       if (task) {
           await prisma.order.update({
               where: { id: task.order_id },
               data: { status: 'DELIVERED' } 
           });
       }
    }

    return { message: "Delivery status updated" };
};
