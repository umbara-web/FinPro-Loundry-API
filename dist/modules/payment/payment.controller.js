"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayments = getPayments;
exports.getPaymentStats = getPaymentStats;
exports.createPayment = createPayment;
exports.handlePaymentWebhook = handlePaymentWebhook;
const payment_service_1 = require("./payment.service");
async function getPayments(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const params = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            sortBy: req.query.sortBy || 'created_at',
            sortOrder: req.query.sortOrder || 'desc',
            search: req.query.search,
            status: req.query.status,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
        };
        const result = await payment_service_1.PaymentService.getPayments(userId, params);
        res.status(200).json({ message: 'OK', data: result });
    }
    catch (error) {
        next(error);
    }
}
async function getPaymentStats(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const stats = await payment_service_1.PaymentService.getPaymentStats(userId);
        res.status(200).json({ message: 'OK', data: stats });
    }
    catch (error) {
        next(error);
    }
}
async function createPayment(req, res, next) {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { orderId, paymentMethod } = req.body;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const result = await payment_service_1.PaymentService.createPayment(userId, orderId, paymentMethod);
        res.status(201).json({
            message: 'Payment initiated',
            data: result,
        });
    }
    catch (error) {
        // Basic error handling mapping
        if (error.message === 'Order not found') {
            return res.status(404).json({ message: error.message });
        }
        if (error.message === 'Forbidden') {
            return res.status(403).json({ message: error.message });
        }
        if (error.message === 'Order already paid') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
}
async function handlePaymentWebhook(req, res, next) {
    try {
        const { orderId, paymentId } = req.body;
        const result = await payment_service_1.PaymentService.handlePaymentWebhook(orderId, paymentId);
        res.json(result);
    }
    catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
}
