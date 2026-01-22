import prisma from "../lib/prisma";

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

export const acceptPickupService = async (driver_id: string, requestId: string) => {

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
    await prisma.$transaction(async (tx: any) => {
        await tx.driver_Task.create({
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
    });

    return { message: "Delivery accepted" };
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
