"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearestOutlet = findNearestOutlet;
exports.createPickup = createPickup;
exports.getMyPickups = getMyPickups;
exports.getPickupById = getPickupById;
exports.cancelPickup = cancelPickup;
const pickup_service_1 = require("./pickup.service");
async function findNearestOutlet(req, res, next) {
    try {
        const { lat, long } = req.query;
        if (!lat || !long)
            return res.status(400).json({ error: 'lat and long are required' });
        const result = await (0, pickup_service_1.findNearestOutletByCoordinates)(lat, long);
        res.status(200).json({ message: 'OK', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function createPickup(req, res, next) {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!customerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { addressId, schedulledPickupAt, notes, outletId, items, manualItems, } = req.body;
        const result = await (0, pickup_service_1.createPickupRequest)({
            customerId,
            addressId,
            scheduledPickupAt: new Date(schedulledPickupAt),
            notes,
            outletId,
            items,
            manualItems,
        });
        res
            .status(201)
            .json({ message: 'Pickup request created successfully', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getMyPickups(req, res, next) {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!customerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const result = await (0, pickup_service_1.getPickupRequestsByCustomer)(customerId);
        res.status(200).json({ message: 'OK', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getPickupById(req, res, next) {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { id } = req.params;
        const result = await (0, pickup_service_1.getPickupRequestById)(id, customerId);
        res.status(200).json({ message: 'OK', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function cancelPickup(req, res, next) {
    var _a;
    try {
        const customerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!customerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { id } = req.params;
        const result = await (0, pickup_service_1.cancelPickupRequest)(id, customerId);
        res
            .status(200)
            .json({ message: 'Pickup request cancelled successfully', data: result });
    }
    catch (error) {
        next(error);
    }
}
