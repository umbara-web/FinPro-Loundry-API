import prisma from "../configs/db";
import { Station_Task_Type } from "@prisma/client";

export const getStationTasksService = async (
  workerId: string,
  stationType: string,
) => {
  try {
    const worker = await prisma.staff.findUnique({
      where: { staff_id: workerId },
    });

    if (!worker) throw new Error("Worker not found");

    const includeRelations = {
      order: {
        include: {
          order_item: { include: { laundry_item: true } },
          pickup_request: {
            include: {
              customer: { select: { name: true, profile_picture_url: true } },
            },
          },
        },
      },
      station_task_item: { include: { laundry_item: true } },
      bypass_request: true,
    };

    const poolTasks = await prisma.station_Task.findMany({
      where: {
        worker_id: null,
        task_type: stationType as Station_Task_Type,
        status: "PENDING",
        order: { outlet_id: worker.outlet_id },
      },
      include: includeRelations,
      orderBy: { started_at: "asc" },
    });

    const myTasks = await prisma.station_Task.findMany({
      where: {
        worker_id: workerId,
        task_type: stationType as Station_Task_Type,
        status: { in: ["IN_PROGRESS", "NEED_BYPASS"] },
      },
      include: includeRelations,
      orderBy: { started_at: "asc" },
    });

    return { pool: poolTasks, mine: myTasks };
  } catch (error) {
    throw error;
  }
};

export const claimTaskService = async (taskId: string, workerId: string) => {
  try {
    const task = await prisma.station_Task.findUnique({
      where: { id: taskId },
    });

    if (!task) throw new Error("Task not found");
    if (task.worker_id !== null)
      throw new Error("Task already claimed by another worker");
    if (task.status !== "PENDING")
      throw new Error("Task is not available for claiming");

    const updatedTask = await prisma.station_Task.update({
      where: { id: taskId },
      data: {
        worker_id: workerId,
        status: "IN_PROGRESS",
        started_at: new Date(),
      },
    });

    return { message: "Task claimed successfully", task: updatedTask };
  } catch (error) {
    throw error;
  }
};

const validateTaskItems = (task: any, inputItems: any[]) => {
  let mismatch = false;
  const processingItems: any[] = [];

  for (const inputItem of inputItems) {
    const originalItem = task.order.order_item.find(
      (oi: any) => oi.laundry_item_id === inputItem.laundry_item_id,
    );

    if (!originalItem || originalItem.qty !== inputItem.qty) {
      mismatch = true;
    }

    processingItems.push({
      station_task_id: task.id,
      laundry_item_id: inputItem.laundry_item_id,
      qty: inputItem.qty,
    });
  }

  if (inputItems.length !== task.order.order_item.length) mismatch = true;

  return { mismatch, processingItems };
};

const handleTaskMismatch = async (taskId: string, processingItems: any[]) => {
  await prisma.$transaction([
    prisma.station_Task.update({
      where: { id: taskId },
      data: { status: "NEED_BYPASS" },
    }),
    prisma.station_Task_Item.createMany({
      data: processingItems,
    }),
  ]);
  return {
    code: "MISMATCH",
    message: "Quantity mismatch. Please request bypass.",
  };
};

const completeTaskTransaction = async (task: any, processingItems: any[]) => {
  await prisma.$transaction(async (tx: any) => {
    await tx.station_Task.update({
      where: { id: task.id },
      data: {
        status: "COMPLETED",
        finished_at: new Date(),
      },
    });

    await tx.station_Task_Item.createMany({
      data: processingItems,
    });

    let nextStationType = null;
    if (task.task_type === "WASHING") nextStationType = "IRONING";
    else if (task.task_type === "IRONING") nextStationType = "PACKING";

    if (nextStationType) {
      await tx.station_Task.create({
        data: {
          order_id: task.order_id,
          task_type: nextStationType as any,
          worker_id: null,
          status: "PENDING",
        },
      });
    } else {
      if (task.task_type === "PACKING") {
        const order = await tx.order.findUnique({
          where: { id: task.order_id },
        });

        const newStatus =
          order?.status === "PAID" ? "READY_FOR_DELIVERY" : "WAITING_PAYMENT";

        await tx.order.update({
          where: { id: task.order_id },
          data: { status: newStatus },
        });
      }
    }
  });

  return { code: "SUCCESS", message: "Task processed successfully" };
};

export const processTaskService = async (
  taskId: string,
  items: any[],
  userId: string,
) => {
  try {
    const task = await prisma.station_Task.findUnique({
      where: { id: taskId },
      include: { order: { include: { order_item: true } } },
    });

    if (!task) throw new Error("Task not found");

    const { mismatch, processingItems } = validateTaskItems(task, items);

    if (mismatch) {
      return await handleTaskMismatch(taskId, processingItems);
    }

    return await completeTaskTransaction(task, processingItems);
  } catch (error) {
    throw error;
  }
};

export const requestBypassService = async (
  taskId: string,
  reason: string,
  workerId: string,
  items?: Array<{ laundry_item_id: string; qty: number }>,
) => {
  try {
    const worker = await prisma.staff.findUnique({
      where: { staff_id: workerId },
    });

    if (!worker) throw new Error("Worker not found");

    const outletAdmin = await prisma.staff.findFirst({
      where: {
        outlet_id: worker.outlet_id,
        staff_type: "OUTLET_ADMIN",
      },
    });

    if (!outletAdmin) throw new Error("No outlet admin found for this outlet");

    await prisma.$transaction(async (tx: any) => {
      // 1. Clear previous worker-reported items (prevent data accumulation)
      await tx.station_Task_Item.deleteMany({
        where: { station_task_id: taskId },
      });

      // 2. Save the worker's current item counts
      if (items && items.length > 0) {
        await tx.station_Task_Item.createMany({
          data: items.map((item) => ({
            station_task_id: taskId,
            laundry_item_id: item.laundry_item_id,
            qty: item.qty,
          })),
        });
      }

      // 3. Update task status to NEED_BYPASS
      await tx.station_Task.update({
        where: { id: taskId },
        data: { status: "NEED_BYPASS" },
      });

      // 4. Create bypass request for outlet admin
      await tx.bypass_Request.create({
        data: {
          station_task_id: taskId,
          outlet_admin_id: outletAdmin.staff_id,
          reason,
          status: "PENDING",
        },
      });
    });

    return { message: "Bypass requested" };
  } catch (error) {
    throw error;
  }
};

export const getWorkerHistoryService = async (
  workerId: string,
  page: number = 1,
  limit: number = 10,
) => {
  try {
    const skip = (page - 1) * limit;

    const [tasks, total] = await prisma.$transaction([
      prisma.station_Task.findMany({
        where: {
          worker_id: workerId,
          status: "COMPLETED",
        },
        include: {
          order: {
            include: {
              pickup_request: {
                include: {
                  customer: { select: { name: true } },
                },
              },
              order_item: { include: { laundry_item: true } },
            },
          },
        },
        orderBy: { finished_at: "desc" },
        skip,
        take: limit,
      }),
      prisma.station_Task.count({
        where: {
          worker_id: workerId,
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      data: tasks.map((task) => ({
        id: task.id,
        orderId: task.order_id,
        orderNumber: `ORD-${task.order_id.slice(-4).toUpperCase()}`,
        taskType: task.task_type,
        customerName: task.order.pickup_request?.customer?.name || "N/A",
        itemCount: task.order.order_item.reduce(
          (sum, item) => sum + item.qty,
          0,
        ),
        completedAt: task.finished_at,
      })),
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

export const getTaskDetailService = async (
  taskId: string,
  workerId: string,
) => {
  try {
    const task = await prisma.station_Task.findUnique({
      where: { id: taskId },
      include: {
        order: {
          include: {
            order_item: { include: { laundry_item: true } },
            pickup_request: {
              include: {
                customer: {
                  select: { name: true, profile_picture_url: true },
                },
              },
            },
          },
        },
        station_task_item: { include: { laundry_item: true } },
        bypass_request: true,
      },
    });

    if (!task) throw new Error("Task not found");

    return task;
  } catch (error) {
    throw error;
  }
};
