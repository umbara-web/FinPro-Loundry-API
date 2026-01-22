import prisma from "../lib/prisma";

export const getStationTasksService = async (worker_id: string) => {
  return await prisma.station_Task.findMany({
    where: {
      worker_id: worker_id,
      status: { in: ['IN_PROGRESS', 'PENDING', 'NEED_BYPASS'] }
    },
    include: {
      order: {
        include: {
          order_item: { include: { laundry_item: true } }
        }
      },
      station_task_item: { include: { laundry_item: true } },
      bypass_request: true
    }
  });
};

export const processTaskService = async (taskId: string, items: any[], userId: string) => {
  const task = await prisma.station_Task.findUnique({
    where: { id: taskId },
    include: { order: { include: { order_item: true } } }
  });

  if (!task) throw new Error("Task not found");

  let mismatch = false;
  const processingItems: any[] = [];

  for (const inputItem of items) {
    const originalItem = task.order.order_item.find((oi: any) => oi.laundry_item_id === inputItem.laundry_item_id);

    if (!originalItem || originalItem.qty !== inputItem.qty) {
      mismatch = true;
    }

    processingItems.push({
      station_task_id: taskId,
      laundry_item_id: inputItem.laundry_item_id,
      qty: inputItem.qty
    });
  }

  if (items.length !== task.order.order_item.length) mismatch = true;

  if (mismatch) {
    await prisma.$transaction([
      prisma.station_Task.update({
        where: { id: taskId },
        data: { status: "NEED_BYPASS" }
      }),
      prisma.station_Task_Item.createMany({
        data: processingItems
      }),
    ]);
    return { code: "MISMATCH", message: "Quantity mismatch. Please request bypass." };
  }

  await prisma.$transaction(async (tx: any) => {
    await tx.station_Task.update({
      where: { id: taskId },
      data: {
        status: "COMPLETED",
        finished_at: new Date()
      }
    });

    await tx.station_Task_Item.createMany({
      data: processingItems
    });

    let nextStationType = null;
    if (task.task_type === 'WASHING') nextStationType = 'IRONING';
    else if (task.task_type === 'IRONING') nextStationType = 'PACKING';

    if (nextStationType) {
      const nextWorker = await tx.staff.findFirst({
        where: { outlet_id: (await tx.staff.findUnique({ where: { staff_id: userId } }))?.outlet_id },
      });

      if (nextWorker) {
        await tx.station_Task.create({
          data: {
            order_id: task.order_id,
            task_type: nextStationType as any,
            worker_id: nextWorker.staff_id,
            status: "PENDING"
          }
        });
      }
    } else {
      if (task.task_type === 'PACKING') {
        const order = await tx.order.findUnique({ where: { id: task.order_id } });
        if (order?.status === 'PAID') {
          await tx.order.update({ where: { id: task.order_id }, data: { status: 'READY_FOR_DELIVERY' } });
        } else {
          await tx.order.update({ where: { id: task.order_id }, data: { status: 'WAITING_PAYMENT' } });
        }
      }
    }
  });

  return { message: "Task processed successfully" };
};

export const requestBypassService = async (taskId: string, reason: string, outletAdminId: string) => {
  await prisma.bypass_Request.create({
    data: {
      station_task_id: taskId,
      outlet_admin_id: outletAdminId,
      reason,
      status: "PENDING"
    }
  });
  return { message: "Bypass requested" };
};
