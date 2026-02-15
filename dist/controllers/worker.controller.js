"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTaskDetail = exports.getWorkerHistory = exports.requestBypass = exports.processTask = exports.claimTask = exports.getStationTasks = void 0;
const worker_service_1 = require("../services/worker.service");
const getStationTasks = async (req, res, next) => {
    var _a;
    try {
        const worker_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!worker_id)
            throw new Error('Unauthorized');
        const stationType = req.query.station || 'WASHING';
        const tasks = await (0, worker_service_1.getStationTasksService)(worker_id, stationType);
        res.status(200).send({ data: tasks });
    }
    catch (error) {
        next(error);
    }
};
exports.getStationTasks = getStationTasks;
const claimTask = async (req, res, next) => {
    var _a;
    try {
        const { taskId } = req.params;
        const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!workerId)
            throw new Error('Unauthorized');
        const result = await (0, worker_service_1.claimTaskService)(taskId, workerId);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.claimTask = claimTask;
const processTask = async (req, res, next) => {
    var _a;
    try {
        const { taskId } = req.params;
        const { items } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const result = await (0, worker_service_1.processTaskService)(taskId, items, userId);
        if (result.code === 'MISMATCH') {
            res.status(400).send(result);
        }
        else {
            res.status(200).send(result);
        }
    }
    catch (error) {
        next(error);
    }
};
exports.processTask = processTask;
const requestBypass = async (req, res, next) => {
    var _a;
    try {
        const { taskId } = req.params;
        const { reason, items } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            throw new Error('Unauthorized');
        const result = await (0, worker_service_1.requestBypassService)(taskId, reason, userId, items);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.requestBypass = requestBypass;
const getWorkerHistory = async (req, res, next) => {
    var _a;
    try {
        const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!workerId)
            throw new Error('Unauthorized');
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const taskType = req.query.taskType;
        const result = await (0, worker_service_1.getWorkerHistoryService)(workerId, page, limit, startDate, endDate, taskType);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getWorkerHistory = getWorkerHistory;
const getTaskDetail = async (req, res, next) => {
    var _a;
    try {
        const { taskId } = req.params;
        const workerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!workerId)
            throw new Error('Unauthorized');
        const result = await (0, worker_service_1.getTaskDetailService)(taskId, workerId);
        res.status(200).send(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getTaskDetail = getTaskDetail;
