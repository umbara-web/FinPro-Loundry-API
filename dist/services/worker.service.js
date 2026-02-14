"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerHistoryService = exports.requestBypassService = exports.processTaskService = exports.claimTaskService = exports.getStationTasksService = void 0;
const db_1 = __importDefault(require("../configs/db"));
const getStationTasksService = async (workerId, stationType) => {
    try {
        const worker = await db_1.default.staff.findUnique({
            where: { staff_id: workerId },
        });
        if (!worker)
            throw new Error("Worker not found");
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
        const poolTasks = await db_1.default.station_Task.findMany({
            where: {
                worker_id: null,
                task_type: stationType,
                status: "PENDING",
                order: { outlet_id: worker.outlet_id },
            },
            include: includeRelations,
            orderBy: { started_at: "asc" },
        });
        const myTasks = await db_1.default.station_Task.findMany({
            where: {
                worker_id: workerId,
                task_type: stationType,
                status: { in: ["IN_PROGRESS", "NEED_BYPASS"] },
            },
            include: includeRelations,
            orderBy: { started_at: "asc" },
        });
        return { pool: poolTasks, mine: myTasks };
    }
    catch (error) {
        throw error;
    }
};
exports.getStationTasksService = getStationTasksService;
const claimTaskService = async (taskId, workerId) => {
    try {
        const task = await db_1.default.station_Task.findUnique({
            where: { id: taskId },
        });
        if (!task)
            throw new Error("Task not found");
        if (task.worker_id !== null)
            throw new Error("Task already claimed by another worker");
        if (task.status !== "PENDING")
            throw new Error("Task is not available for claiming");
        const updatedTask = await db_1.default.station_Task.update({
            where: { id: taskId },
            data: {
                worker_id: workerId,
                status: "IN_PROGRESS",
                started_at: new Date(),
            },
        });
        return { message: "Task claimed successfully", task: updatedTask };
    }
    catch (error) {
        throw error;
    }
};
exports.claimTaskService = claimTaskService;
const validateTaskItems = (task, inputItems) => {
    let mismatch = false;
    const processingItems = [];
    for (const inputItem of inputItems) {
        const originalItem = task.order.order_item.find((oi) => oi.laundry_item_id === inputItem.laundry_item_id);
        if (!originalItem || originalItem.qty !== inputItem.qty) {
            mismatch = true;
        }
        processingItems.push({
            station_task_id: task.id,
            laundry_item_id: inputItem.laundry_item_id,
            qty: inputItem.qty,
        });
    }
    if (inputItems.length !== task.order.order_item.length)
        mismatch = true;
    return { mismatch, processingItems };
};
const handleTaskMismatch = async (taskId, processingItems) => {
    await db_1.default.$transaction([
        db_1.default.station_Task.update({
            where: { id: taskId },
            data: { status: "NEED_BYPASS" },
        }),
        db_1.default.station_Task_Item.createMany({
            data: processingItems,
        }),
    ]);
    return {
        code: "MISMATCH",
        message: "Quantity mismatch. Please request bypass.",
    };
};
const completeTaskTransaction = async (task, processingItems) => {
    await db_1.default.$transaction(async (tx) => {
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
        if (task.task_type === "WASHING")
            nextStationType = "IRONING";
        else if (task.task_type === "IRONING")
            nextStationType = "PACKING";
        if (nextStationType) {
            await tx.station_Task.create({
                data: {
                    order_id: task.order_id,
                    task_type: nextStationType,
                    worker_id: null,
                    status: "PENDING",
                },
            });
        }
        else {
            if (task.task_type === "PACKING") {
                const order = await tx.order.findUnique({
                    where: { id: task.order_id },
                });
                const newStatus = (order === null || order === void 0 ? void 0 : order.status) === "PAID" ? "READY_FOR_DELIVERY" : "WAITING_PAYMENT";
                await tx.order.update({
                    where: { id: task.order_id },
                    data: { status: newStatus },
                });
            }
        }
    });
    return { code: "SUCCESS", message: "Task processed successfully" };
};
const processTaskService = async (taskId, items, userId) => {
    try {
        const task = await db_1.default.station_Task.findUnique({
            where: { id: taskId },
            include: { order: { include: { order_item: true } } },
        });
        if (!task)
            throw new Error("Task not found");
        const { mismatch, processingItems } = validateTaskItems(task, items);
        if (mismatch) {
            return await handleTaskMismatch(taskId, processingItems);
        }
        return await completeTaskTransaction(task, processingItems);
    }
    catch (error) {
        throw error;
    }
};
exports.processTaskService = processTaskService;
const requestBypassService = async (taskId, reason, workerId) => {
    try {
        const worker = await db_1.default.staff.findUnique({
            where: { staff_id: workerId },
        });
        if (!worker)
            throw new Error("Worker not found");
        const outletAdmin = await db_1.default.staff.findFirst({
            where: {
                outlet_id: worker.outlet_id,
                staff_type: "OUTLET_ADMIN",
            },
        });
        if (!outletAdmin)
            throw new Error("No outlet admin found for this outlet");
        await db_1.default.bypass_Request.create({
            data: {
                station_task_id: taskId,
                outlet_admin_id: outletAdmin.staff_id,
                reason,
                status: "PENDING",
            },
        });
        return { message: "Bypass requested" };
    }
    catch (error) {
        throw error;
    }
};
exports.requestBypassService = requestBypassService;
const getWorkerHistoryService = async (workerId, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const [tasks, total] = await db_1.default.$transaction([
            db_1.default.station_Task.findMany({
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
            db_1.default.station_Task.count({
                where: {
                    worker_id: workerId,
                    status: "COMPLETED",
                },
            }),
        ]);
        return {
            data: tasks.map((task) => {
                var _a, _b;
                return ({
                    id: task.id,
                    orderId: task.order_id,
                    orderNumber: `ORD-${task.order_id.slice(-4).toUpperCase()}`,
                    taskType: task.task_type,
                    customerName: ((_b = (_a = task.order.pickup_request) === null || _a === void 0 ? void 0 : _a.customer) === null || _b === void 0 ? void 0 : _b.name) || "N/A",
                    itemCount: task.order.order_item.reduce((sum, item) => sum + item.qty, 0),
                    completedAt: task.finished_at,
                });
            }),
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        throw error;
    }
};
exports.getWorkerHistoryService = getWorkerHistoryService;
