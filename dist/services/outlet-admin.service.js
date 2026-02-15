"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrderService = exports.getDashboardStatsService = exports.handleBypassRequestService = exports.getBypassRequestsService = exports.getAttendanceReportService = void 0;
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
                        in: staffType && staffType !== 'ALL'
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
            check_in_at: 'desc',
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
const getBypassRequestsService = async (outletId) => {
    try {
        const requests = await db_1.default.bypass_Request.findMany({
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
        return requests.map((req) => {
            var _a, _b;
            return ({
                id: req.id,
                taskId: req.station_task_id,
                workerName: ((_a = req.station_task.worker) === null || _a === void 0 ? void 0 : _a.name) || 'Unknown',
                workerAvatar: (_b = req.station_task.worker) === null || _b === void 0 ? void 0 : _b.profile_picture_url,
                station: req.station_task.task_type,
                reason: req.reason,
                createdAt: req.station_task.started_at, // Approximate timestamp
                items: req.station_task.station_task_item.map((item) => {
                    var _a;
                    return ({
                        id: item.laundry_item_id,
                        name: item.laundry_item.name,
                        qty: item.qty,
                        expectedQty: ((_a = req.station_task.order.order_item.find((oi) => oi.laundry_item_id === item.laundry_item_id)) === null || _a === void 0 ? void 0 : _a.qty) || 0,
                    });
                }),
            });
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getBypassRequestsService = getBypassRequestsService;
const handleBypassRequestService = async (requestId, action, adminId) => {
    try {
        const request = await db_1.default.bypass_Request.findUnique({
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
        if (!request)
            throw new Error('Bypass request not found');
        if (request.status !== 'PENDING')
            throw new Error('Request already handled');
        if (action === 'REJECT') {
            await db_1.default.bypass_Request.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED',
                    outlet_admin_id: adminId,
                },
            });
            return { message: 'Bypass request rejected' };
        }
        // APPROVE LOGIC
        await db_1.default.$transaction(async (tx) => {
            var _a;
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
            if (task.task_type === 'WASHING')
                nextStationType = 'IRONING';
            else if (task.task_type === 'IRONING')
                nextStationType = 'PACKING';
            if (nextStationType) {
                await tx.station_Task.create({
                    data: {
                        order_id: task.order_id,
                        task_type: nextStationType,
                        worker_id: null,
                        status: 'PENDING',
                    },
                });
            }
            else {
                if (task.task_type === 'PACKING') {
                    const order = task.order;
                    const isPaid = (order === null || order === void 0 ? void 0 : order.status) === 'PAID' ||
                        (order === null || order === void 0 ? void 0 : order.paid_at) != null ||
                        ((_a = order === null || order === void 0 ? void 0 : order.payment) === null || _a === void 0 ? void 0 : _a.some((p) => p.status === 'PAID'));
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
    }
    catch (error) {
        throw error;
    }
};
exports.handleBypassRequestService = handleBypassRequestService;
const getDashboardStatsService = async (outletId) => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const [ordersToday, ordersYesterday, pending, inProgress, ready] = await Promise.all([
        // Orders created today
        db_1.default.order.count({
            where: {
                outlet_id: outletId,
                created_at: { gte: startOfToday },
            },
        }),
        // Orders created yesterday (for trend)
        db_1.default.order.count({
            where: {
                outlet_id: outletId,
                created_at: { gte: startOfYesterday, lt: startOfToday },
            },
        }),
        // Pending orders
        db_1.default.order.count({
            where: {
                outlet_id: outletId,
                status: client_1.Order_Status.CREATED,
            },
        }),
        // In progress orders
        db_1.default.order.count({
            where: {
                outlet_id: outletId,
                status: {
                    in: [
                        client_1.Order_Status.IN_WASHING,
                        client_1.Order_Status.IN_IRONING,
                        client_1.Order_Status.IN_PACKING,
                    ],
                },
            },
        }),
        // Ready orders
        db_1.default.order.count({
            where: {
                outlet_id: outletId,
                status: {
                    in: [client_1.Order_Status.READY_FOR_DELIVERY, client_1.Order_Status.ON_DELIVERY],
                },
            },
        }),
    ]);
    // Calculate trend
    let trend = null;
    if (ordersYesterday > 0) {
        const change = Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100);
        trend = `${change >= 0 ? '+' : ''}${change}% from yesterday`;
    }
    else if (ordersToday > 0) {
        trend = '+100% from yesterday';
    }
    return {
        ordersToday,
        trend,
        pending,
        inProgress,
        ready,
    };
};
exports.getDashboardStatsService = getDashboardStatsService;
const processOrderService = async (outletId, orderId, payload) => {
    const { items, totalWeight } = payload;
    const order = await db_1.default.order.findUnique({
        where: { id: orderId },
        include: {
            pickup_request: true,
            order_item: true,
        },
    });
    if (!order)
        throw new Error('Order not found');
    if (order.status !== client_1.Order_Status.CREATED) {
        // Allow processing even if status is not strictly CREATED, but it should be in a state before washing.
        if (order.status === client_1.Order_Status.IN_WASHING ||
            order.status === client_1.Order_Status.COMPLETED) {
            throw new Error('Order already processed');
        }
    }
    return await db_1.default.$transaction(async (tx) => {
        // Update Order Items
        for (const item of items) {
            const existingItem = order.order_item.find((oi) => oi.laundry_item_id === item.laundry_item_id);
            if (existingItem) {
                if (existingItem.qty !== item.qty) {
                    await tx.order_Item.update({
                        where: { id: existingItem.id },
                        data: { qty: item.qty },
                    });
                }
            }
        }
        // Calculate Price
        const basePricePerKg = 6000;
        const priceTotal = Math.floor(totalWeight * basePricePerKg); // No rounding to 100 for now, straightforward math
        // Update Order
        await tx.order.update({
            where: { id: orderId },
            data: {
                total_weight: totalWeight,
                price_total: priceTotal,
                status: client_1.Order_Status.IN_WASHING,
            },
        });
        // Create Washing Task
        await tx.station_Task.create({
            data: {
                order_id: orderId,
                task_type: client_1.Station_Task_Type.WASHING,
                status: 'PENDING',
            },
        });
        const staffName = 'Outlet Admin'; // We might want to pass this down if needed for logs
        return { message: 'Order processed successfully' };
    });
};
exports.processOrderService = processOrderService;
