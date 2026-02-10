"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = require("./order.service");
class OrderController {
    static async getOrders(req, res, next) {
        try {
            const user = OrderController.validateUser(req);
            const params = OrderController.parseQueryParams(req.query);
            const result = await order_service_1.OrderService.getAllOrders(user.userId, params);
            OrderController.sendSuccessResponse(res, result);
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrderStats(req, res, next) {
        try {
            const user = OrderController.validateUser(req);
            const result = await order_service_1.OrderService.getOrderStats(user.userId);
            res.status(200).json({
                message: 'Order stats retrieved successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmOrder(req, res, next) {
        try {
            const user = OrderController.validateUser(req);
            const { orderId } = req.params;
            const result = await order_service_1.OrderService.confirmOrder(user.userId, orderId);
            res.status(200).json({
                message: 'Order confirmed successfully',
                data: result,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static validateUser(req) {
        const user = req.user;
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    static parseQueryParams(query) {
        const { page, limit, sortBy, sortOrder, search, status, dateFrom, dateTo } = query;
        return {
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10,
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'desc',
            search,
            status,
            dateFrom,
            dateTo,
        };
    }
    static sendSuccessResponse(res, result) {
        res.status(200).json({
            message: 'Orders retrieved successfully',
            data: result.data,
            meta: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
            },
        });
    }
}
exports.OrderController = OrderController;
