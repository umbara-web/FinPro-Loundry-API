"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.handleBypassRequest = exports.getBypassRequests = exports.getAttendanceReportController = void 0;
const outlet_admin_service_1 = require("../services/outlet-admin.service");
const db_1 = __importDefault(require("../configs/db"));
const getAttendanceReportController = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        // Fetch the admin's outlet from the Staff table
        const staffRecord = await db_1.default.staff.findFirst({
            where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
        });
        if (!staffRecord) {
            return res
                .status(403)
                .json({ message: 'You are not assigned to any outlet' });
        }
        const { startDate, endDate, staffType } = req.query;
        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ message: 'Start date and end date are required' });
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        // Set end of day for the end date to include records from that day
        end.setHours(23, 59, 59, 999);
        const report = await (0, outlet_admin_service_1.getAttendanceReportService)({
            outletId: staffRecord.outlet_id,
            startDate: start,
            endDate: end,
            staffType: staffType,
        });
        res.status(200).send({
            message: 'Attendance report fetched successfully',
            data: report,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAttendanceReportController = getAttendanceReportController;
const getBypassRequests = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const staffRecord = await db_1.default.staff.findFirst({
            where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
        });
        if (!staffRecord) {
            return res
                .status(403)
                .json({ message: 'You are not assigned to any outlet' });
        }
        const requests = await (0, outlet_admin_service_1.getBypassRequestsService)(staffRecord.outlet_id);
        res.status(200).json({ data: requests });
    }
    catch (error) {
        next(error);
    }
};
exports.getBypassRequests = getBypassRequests;
const handleBypassRequest = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { requestId } = req.params;
        const { action } = req.body; // 'APPROVE' or 'REJECT'
        if (!['APPROVE', 'REJECT'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }
        const result = await (0, outlet_admin_service_1.handleBypassRequestService)(requestId, action, userId);
        res.status(200).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.handleBypassRequest = handleBypassRequest;
const getDashboardStats = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const staffRecord = await db_1.default.staff.findFirst({
            where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
        });
        if (!staffRecord) {
            return res
                .status(403)
                .json({ message: 'You are not assigned to any outlet' });
        }
        const stats = await (0, outlet_admin_service_1.getDashboardStatsService)(staffRecord.outlet_id);
        res.status(200).json({
            message: 'Dashboard stats fetched successfully',
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
