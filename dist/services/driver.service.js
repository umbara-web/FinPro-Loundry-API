"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatusService = exports.getDeliveryByIdService = exports.acceptDeliveryService = exports.getAvailableDeliveriesService = exports.updatePickupStatusService = exports.acceptPickupService = exports.getPickupByIdService = exports.getAvailablePickupsService = exports.getDriverHistoryService = exports.getActiveJobService = void 0;
const db_1 = __importDefault(require("../configs/db"));
const customError_1 = require("../common/utils/customError");
const hasActiveJob = async (driver_id) => {
    try {
        const activePickup = await db_1.default.pickup_Request.findFirst({
            where: {
                assigned_driver_id: driver_id,
                status: {
                    in: ["DRIVER_ASSIGNED", "PICKED_UP"],
                },
            },
        });
        if (activePickup)
            return true;
        const activeDelivery = await db_1.default.driver_Task.findFirst({
            where: {
                driver_id: driver_id,
                status: {
                    in: ["ACCEPTED", "IN_PROGRESS"],
                },
            },
        });
        return !!activeDelivery;
    }
    catch (error) {
        throw error;
    }
};
const getActiveJobService = async (driver_id) => {
    try {
        const [activePickup, activeDelivery] = await Promise.all([
            db_1.default.pickup_Request.findFirst({
                where: {
                    assigned_driver_id: driver_id,
                    status: {
                        in: ["DRIVER_ASSIGNED", "PICKED_UP"],
                    },
                },
                include: {
                    customer: { select: { name: true, phone: true } },
                    customer_address: true,
                },
            }),
            db_1.default.driver_Task.findFirst({
                where: {
                    driver_id: driver_id,
                    status: {
                        in: ["ACCEPTED", "IN_PROGRESS"],
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
                type: "PICKUP",
                data: activePickup,
            };
        }
        if (activeDelivery) {
            return {
                type: "DELIVERY",
                data: activeDelivery,
            };
        }
        return null;
    }
    catch (error) {
        throw error;
    }
};
exports.getActiveJobService = getActiveJobService;
const getDriverHistoryService = async (driver_id, page = 1, limit = 10, date) => {
    try {
        const skip = (page - 1) * limit;
        const fetchLimit = skip + limit;
        let dateFilter;
        if (date === "today") {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            dateFilter = { gte: startOfDay, lt: endOfDay };
        }
        const [completedPickups, completedDeliveries] = await Promise.all([
            db_1.default.pickup_Request.findMany({
                where: Object.assign({ assigned_driver_id: driver_id, status: "ARRIVED_OUTLET" }, (dateFilter ? { updated_at: dateFilter } : {})),
                include: {
                    customer: { select: { name: true } },
                    customer_address: { select: { address: true } },
                    order: { select: { id: true } },
                },
                orderBy: { updated_at: "desc" },
                take: fetchLimit,
            }),
            db_1.default.driver_Task.findMany({
                where: Object.assign({ driver_id: driver_id, status: "DONE" }, (dateFilter ? { finished_at: dateFilter } : {})),
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
                orderBy: { finished_at: "desc" },
                take: fetchLimit,
            }),
        ]);
        const history = [
            ...completedPickups.map((p) => {
                var _a, _b, _c;
                return ({
                    id: p.id,
                    type: "PICKUP",
                    order_number: ((_a = p.order[0]) === null || _a === void 0 ? void 0 : _a.id)
                        ? `ORD-${p.order[0].id.slice(-4).toUpperCase()}`
                        : `PKP-${p.id.slice(-4).toUpperCase()}`,
                    customer_name: ((_b = p.customer) === null || _b === void 0 ? void 0 : _b.name) || "N/A",
                    address: ((_c = p.customer_address) === null || _c === void 0 ? void 0 : _c.address) || "N/A",
                    completed_at: p.updated_at,
                    status: "SELESAI",
                });
            }),
            ...completedDeliveries.map((d) => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: d.id,
                    type: "DELIVERY",
                    order_number: `ORD-${d.order_id.slice(-4).toUpperCase()}`,
                    customer_name: ((_c = (_b = (_a = d.order) === null || _a === void 0 ? void 0 : _a.pickup_request) === null || _b === void 0 ? void 0 : _b.customer) === null || _c === void 0 ? void 0 : _c.name) || "N/A",
                    address: ((_f = (_e = (_d = d.order) === null || _d === void 0 ? void 0 : _d.pickup_request) === null || _e === void 0 ? void 0 : _e.customer_address) === null || _f === void 0 ? void 0 : _f.address) || "N/A",
                    completed_at: d.finished_at || d.order.updated_at,
                    status: "SELESAI",
                });
            }),
        ].sort((a, b) => new Date(b.completed_at).getTime() -
            new Date(a.completed_at).getTime());
        const [totalPickups, totalDeliveries] = await Promise.all([
            db_1.default.pickup_Request.count({
                where: Object.assign({ assigned_driver_id: driver_id, status: "ARRIVED_OUTLET" }, (dateFilter ? { updated_at: dateFilter } : {})),
            }),
            db_1.default.driver_Task.count({
                where: Object.assign({ driver_id: driver_id, status: "DONE" }, (dateFilter ? { finished_at: dateFilter } : {})),
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
    }
    catch (error) {
        throw error;
    }
};
exports.getDriverHistoryService = getDriverHistoryService;
const getAvailablePickupsService = async (driver_id) => {
    try {
        const driver = await db_1.default.staff.findUnique({
            where: { staff_id: driver_id },
            include: { outlet: true },
        });
        if (!driver)
            throw new Error("Driver profile not found");
        return await db_1.default.pickup_Request.findMany({
            where: {
                assigned_outlet_id: driver.outlet_id,
                status: "WAITING_DRIVER",
                assigned_driver_id: null,
            },
            include: {
                customer: { select: { name: true, phone: true } },
                customer_address: true,
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAvailablePickupsService = getAvailablePickupsService;
// Get single pickup by ID
const getPickupByIdService = async (driver_id, pickupId) => {
    try {
        const driver = await db_1.default.staff.findUnique({
            where: { staff_id: driver_id },
        });
        const pickup = await db_1.default.pickup_Request.findFirst({
            where: {
                id: pickupId,
                OR: [
                    { assigned_driver_id: driver_id },
                    { status: "WAITING_DRIVER", assigned_outlet_id: driver === null || driver === void 0 ? void 0 : driver.outlet_id },
                ],
            },
            include: {
                customer: { select: { name: true, phone: true } },
                customer_address: true,
                outlet: true,
            },
        });
        if (!pickup)
            throw (0, customError_1.createCustomError)(404, "Pickup tidak ditemukan atau bukan milik Anda");
        return pickup;
    }
    catch (error) {
        throw error;
    }
};
exports.getPickupByIdService = getPickupByIdService;
const acceptPickupService = async (driver_id, requestId) => {
    try {
        if (await hasActiveJob(driver_id)) {
            throw (0, customError_1.createCustomError)(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
        }
        await db_1.default.pickup_Request.update({
            where: { id: requestId },
            data: {
                assigned_driver_id: driver_id,
                status: "DRIVER_ASSIGNED",
            },
        });
        return { message: "Pickup accepted" };
    }
    catch (error) {
        throw error;
    }
};
exports.acceptPickupService = acceptPickupService;
const updatePickupStatusService = async (requestId, status) => {
    try {
        await db_1.default.pickup_Request.update({
            where: { id: requestId },
            data: { status },
        });
        return { message: "Status updated" };
    }
    catch (error) {
        throw error;
    }
};
exports.updatePickupStatusService = updatePickupStatusService;
const getAvailableDeliveriesService = async (driver_id) => {
    try {
        const driver = await db_1.default.staff.findUnique({
            where: { staff_id: driver_id },
        });
        if (!driver)
            throw new Error("Driver profile not found");
        return await db_1.default.order.findMany({
            where: {
                outlet_id: driver.outlet_id,
                status: "READY_FOR_DELIVERY",
            },
            include: {
                pickup_request: {
                    include: { customer_address: true, customer: true },
                },
            },
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAvailableDeliveriesService = getAvailableDeliveriesService;
const acceptDeliveryService = async (driver_id, orderId) => {
    try {
        if (await hasActiveJob(driver_id)) {
            throw (0, customError_1.createCustomError)(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
        }
        const task = await db_1.default.$transaction(async (tx) => {
            const newTask = await tx.driver_Task.create({
                data: {
                    driver_id: driver_id,
                    order_id: orderId,
                    task_type: "DELIVERY",
                    status: "ACCEPTED",
                },
            });
            await tx.order.update({
                where: { id: orderId },
                data: { status: "ON_DELIVERY" },
            });
            return newTask;
        });
        return { message: "Delivery accepted", data: task };
    }
    catch (error) {
        throw error;
    }
};
exports.acceptDeliveryService = acceptDeliveryService;
// Get single delivery task by ID
const getDeliveryByIdService = async (driver_id, taskId) => {
    try {
        const task = await db_1.default.driver_Task.findFirst({
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
            throw (0, customError_1.createCustomError)(404, "Delivery task tidak ditemukan atau bukan milik Anda");
        return task;
    }
    catch (error) {
        throw error;
    }
};
exports.getDeliveryByIdService = getDeliveryByIdService;
const updateDeliveryStatusService = async (taskId, status) => {
    try {
        await db_1.default.driver_Task.update({
            where: { id: taskId },
            data: { status, finished_at: status === "DONE" ? new Date() : null },
        });
        if (status === "DONE") {
            const task = await db_1.default.driver_Task.findUnique({
                where: { id: taskId },
            });
            if (task) {
                await db_1.default.order.update({
                    where: { id: task.order_id },
                    data: { status: "DELIVERED" },
                });
            }
        }
        return { message: "Delivery status updated" };
    }
    catch (error) {
        throw error;
    }
};
exports.updateDeliveryStatusService = updateDeliveryStatusService;
