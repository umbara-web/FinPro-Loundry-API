"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const logger_1 = require("../../lib/logger");
class ComplaintService {
    /**
     * Create a new complaint for an order
     */
    static async createComplaint(params) {
        const { orderId, customerId } = params;
        await this.validateOrderForComplaint(orderId, customerId);
        await this.ensureNoActiveComplaint(orderId, customerId);
        return this.persistComplaint(params);
    }
    static async validateOrderForComplaint(orderId, customerId) {
        const order = await db_1.default.order.findUnique({
            where: { id: orderId },
            include: { pickup_request: true },
        });
        if (!order)
            throw new Error('Order not found');
        if (order.pickup_request.customer_id !== customerId) {
            throw new Error('You can only file complaints for your own orders');
        }
        if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
            throw new Error('Complaints can only be filed for delivered or completed orders');
        }
    }
    static async ensureNoActiveComplaint(orderId, customerId) {
        const existingComplaint = await db_1.default.complaint.findFirst({
            where: {
                order_id: orderId,
                customer_id: customerId,
                status: { in: ['OPEN', 'IN_REVIEW'] },
            },
        });
        if (existingComplaint) {
            throw new Error('You already have an active complaint for this order');
        }
    }
    static async persistComplaint(params) {
        return db_1.default.complaint.create({
            data: {
                order_id: params.orderId,
                customer_id: params.customerId,
                type: params.type,
                description: params.description,
                images: params.images || [],
                status: 'OPEN',
            },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        total_weight: true,
                        price_total: true,
                    },
                },
            },
        });
    }
    static async getComplaints(params) {
        const { customerId, page, limit, status, sortBy = 'created_at', sortOrder = 'desc', search, } = params;
        const where = Object.assign(Object.assign({ customer_id: customerId }, (status && { status })), (search && {
            order: {
                id: { contains: search, mode: 'insensitive' },
            },
        }));
        const [total, complaints] = await Promise.all([
            db_1.default.complaint.count({ where }),
            this.fetchComplaintsList(where, page, limit, sortBy, sortOrder),
        ]);
        return {
            data: complaints,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async fetchComplaintsList(where, page, limit, sortBy, sortOrder) {
        return db_1.default.complaint.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        total_weight: true,
                        price_total: true,
                        created_at: true,
                    },
                },
            },
        });
    }
    static async getComplaintById(complaintId, customerId) {
        const complaint = await db_1.default.complaint.findUnique({
            where: { id: complaintId },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        total_weight: true,
                        price_total: true,
                        created_at: true,
                        order_item: { include: { laundry_item: true } },
                    },
                },
            },
        });
        if (!complaint)
            throw new Error('Complaint not found');
        if (complaint.customer_id !== customerId)
            throw new Error('You can only view your own complaints');
        return complaint;
    }
    static async getComplaintByOrderId(orderId, customerId) {
        return db_1.default.complaint.findFirst({
            where: { order_id: orderId, customer_id: customerId },
            include: { order: { select: { id: true, status: true } } },
        });
    }
    static async updateStatus(complaintId, status) {
        const complaint = await db_1.default.complaint.update({
            where: { id: complaintId },
            data: { status },
            include: { customer: true, order: true },
        });
        this.triggerStatusEmail(complaint, status);
        return complaint;
    }
    static async triggerStatusEmail(complaint, status) {
        try {
            const { sendComplaintStatusEmail, } = require('../../common/utils/email.helper');
            await sendComplaintStatusEmail(complaint.customer.email, complaint.customer.name, complaint.id, status, complaint.order.id);
        }
        catch (err) {
            logger_1.logger.error('Failed to send email:', err.message || err);
        }
    }
}
exports.ComplaintService = ComplaintService;
