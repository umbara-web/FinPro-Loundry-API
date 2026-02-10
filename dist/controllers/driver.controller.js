"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryById = exports.getPickupById = exports.getDriverHistory = exports.getActiveJob = exports.updateDeliveryStatus = exports.acceptDelivery = exports.getAvailableDeliveries = exports.updatePickupStatus = exports.acceptPickup = exports.getAvailablePickups = void 0;
const driver_service_1 = require("../services/driver.service");
const getAvailablePickups = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const result = await (0, driver_service_1.getAvailablePickupsService)(driver_id);
        res.status(200).send({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailablePickups = getAvailablePickups;
const acceptPickup = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const { requestId } = req.params;
        const result = await (0, driver_service_1.acceptPickupService)(driver_id, requestId);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.acceptPickup = acceptPickup;
const updatePickupStatus = async (req, res, next) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body;
        const result = await (0, driver_service_1.updatePickupStatusService)(requestId, status);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePickupStatus = updatePickupStatus;
const getAvailableDeliveries = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const result = await (0, driver_service_1.getAvailableDeliveriesService)(driver_id);
        res.status(200).send({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailableDeliveries = getAvailableDeliveries;
const acceptDelivery = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const { orderId } = req.params;
        const result = await (0, driver_service_1.acceptDeliveryService)(driver_id, orderId);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.acceptDelivery = acceptDelivery;
const updateDeliveryStatus = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        const result = await (0, driver_service_1.updateDeliveryStatusService)(taskId, status);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
const getActiveJob = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const result = await (0, driver_service_1.getActiveJobService)(driver_id);
        res.status(200).send({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveJob = getActiveJob;
const getDriverHistory = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await (0, driver_service_1.getDriverHistoryService)(driver_id, page, limit);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getDriverHistory = getDriverHistory;
const getPickupById = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const { pickupId } = req.params;
        const result = await (0, driver_service_1.getPickupByIdService)(driver_id, pickupId);
        res.status(200).send({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getPickupById = getPickupById;
const getDeliveryById = async (req, res, next) => {
    var _a;
    try {
        const driver_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!driver_id)
            throw new Error("Unauthorized");
        const { taskId } = req.params;
        const result = await (0, driver_service_1.getDeliveryByIdService)(driver_id, taskId);
        res.status(200).send({ data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.getDeliveryById = getDeliveryById;
