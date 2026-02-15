"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = exports.getHistory = exports.clockOut = exports.clockIn = void 0;
const attendance_service_1 = require("../services/attendance.service");
const clockIn = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const result = await (0, attendance_service_1.clockInService)(userId);
        res.status(201).send(result);
    }
    catch (error) {
        if (error.message === 'Staff profile not found' ||
            error.message === 'No shift assigned to this staff') {
            res.status(404).send({ message: error.message });
        }
        else if (error.message === 'Already clocked in today') {
            res.status(400).send({ message: error.message });
        }
        else {
            next(error);
        }
    }
};
exports.clockIn = clockIn;
const clockOut = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const result = await (0, attendance_service_1.clockOutService)(userId);
        res.status(200).send(result);
    }
    catch (error) {
        if (error.message === 'No active check-in found for today') {
            res.status(400).send({ message: error.message });
        }
        else {
            next(error);
        }
    }
};
exports.clockOut = clockOut;
const getHistory = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const history = await (0, attendance_service_1.getHistoryService)(userId);
        res.status(200).send({ data: history });
    }
    catch (error) {
        next(error);
    }
};
exports.getHistory = getHistory;
const getStatus = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const status = await (0, attendance_service_1.getStatusService)(userId);
        res.status(200).send({ data: status });
    }
    catch (error) {
        next(error);
    }
};
exports.getStatus = getStatus;
