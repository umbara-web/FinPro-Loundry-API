"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatusService = exports.getDeliveryByIdService = exports.acceptDeliveryService = exports.getAvailableDeliveriesService = exports.updatePickupStatusService = exports.acceptPickupService = exports.getPickupByIdService = exports.getAvailablePickupsService = exports.getDriverHistoryService = exports.getActiveJobService = void 0;
const db_1 = __importDefault(require("../configs/db"));
const customError_1 = require("../common/utils/customError");
// Helper: Check if driver has an active job
const hasActiveJob = async (driver_id) => {
    // Check for active pickup (assigned but not arrived at outlet)
    const activePickup = await db_1.default.pickup_Request.findFirst({
        where: {
            assigned_driver_id: driver_id,
            status: {
                in: ["DRIVER_ASSIGNED", "PICKED_UP"]
            }
        }
    });
    if (activePickup)
        return true;
    // Check for active delivery task
    const activeDelivery = await db_1.default.driver_Task.findFirst({
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
const getActiveJobService = async (driver_id) => {
    try {
        // Check for active pickup first
        const activePickup = await db_1.default.pickup_Request.findFirst({
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
        const activeDelivery = await db_1.default.driver_Task.findFirst({
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
    }
    catch (error) {
        throw error;
    }
};
exports.getActiveJobService = getActiveJobService;
// Get driver's job history
const getDriverHistoryService = async (driver_id, page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        // Get completed pickups
        const completedPickups = await db_1.default.pickup_Request.findMany({
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
        const completedDeliveries = await db_1.default.driver_Task.findMany({
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
            ...completedPickups.map(p => {
                var _a, _b, _c;
                return ({
                    id: p.id,
                    type: "PICKUP",
                    order_number: ((_a = p.order[0]) === null || _a === void 0 ? void 0 : _a.id) ? `ORD-${p.order[0].id.slice(-4).toUpperCase()}` : `PKP-${p.id.slice(-4).toUpperCase()}`,
                    customer_name: ((_b = p.customer) === null || _b === void 0 ? void 0 : _b.name) || "N/A",
                    address: ((_c = p.customer_address) === null || _c === void 0 ? void 0 : _c.address) || "N/A",
                    completed_at: p.updated_at,
                    status: "SELESAI"
                });
            }),
            ...completedDeliveries.map(d => {
                var _a, _b, _c, _d, _e, _f;
                return ({
                    id: d.id,
                    type: "DELIVERY",
                    order_number: `ORD-${d.order_id.slice(-4).toUpperCase()}`,
                    customer_name: ((_c = (_b = (_a = d.order) === null || _a === void 0 ? void 0 : _a.pickup_request) === null || _b === void 0 ? void 0 : _b.customer) === null || _c === void 0 ? void 0 : _c.name) || "N/A",
                    address: ((_f = (_e = (_d = d.order) === null || _d === void 0 ? void 0 : _d.pickup_request) === null || _e === void 0 ? void 0 : _e.customer_address) === null || _f === void 0 ? void 0 : _f.address) || "N/A",
                    completed_at: d.finished_at,
                    status: "SELESAI"
                });
            })
        ].sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
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
            include: { outlet: true }
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
                customer_address: true
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAvailablePickupsService = getAvailablePickupsService;
// Get single pickup by ID (for driver assigned to it)
const getPickupByIdService = async (driver_id, pickupId) => {
    try {
        const pickup = await db_1.default.pickup_Request.findFirst({
            where: {
                id: pickupId,
                assigned_driver_id: driver_id
            },
            include: {
                customer: { select: { name: true, phone: true } },
                customer_address: true
            }
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
        // Check if driver already has an active job
        if (await hasActiveJob(driver_id)) {
            throw (0, customError_1.createCustomError)(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
        }
        await db_1.default.pickup_Request.update({
            where: { id: requestId },
            data: {
                assigned_driver_id: driver_id,
                status: "DRIVER_ASSIGNED"
            }
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
            data: { status }
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
                status: "READY_FOR_DELIVERY"
            },
            include: {
                pickup_request: {
                    include: { customer_address: true, customer: true }
                }
            }
        });
    }
    catch (error) {
        throw error;
    }
};
exports.getAvailableDeliveriesService = getAvailableDeliveriesService;
const acceptDeliveryService = async (driver_id, orderId) => {
    try {
        // Check if driver already has an active job
        if (await hasActiveJob(driver_id)) {
            throw (0, customError_1.createCustomError)(400, "Anda sudah memiliki pekerjaan aktif. Selesaikan terlebih dahulu.");
        }
        const task = await db_1.default.$transaction(async (tx) => {
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
    }
    catch (error) {
        throw error;
    }
};
exports.acceptDeliveryService = acceptDeliveryService;
// Get single delivery task by ID (for driver assigned to it)
const getDeliveryByIdService = async (driver_id, taskId) => {
    try {
        const task = await db_1.default.driver_Task.findFirst({
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
            data: { status, finished_at: status === 'DONE' ? new Date() : null }
        });
        if (status === 'DONE') {
            const task = await db_1.default.driver_Task.findUnique({ where: { id: taskId } });
            if (task) {
                await db_1.default.order.update({
                    where: { id: task.order_id },
                    data: { status: 'DELIVERED' }
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
