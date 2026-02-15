"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const payment_helpers_1 = require("./payment.helpers");
class PaymentService {
    static async getPayments(userId, params) {
        const { page, limit, sortBy, sortOrder } = params;
        const skip = (page - 1) * limit;
        const where = payment_helpers_1.PaymentQueryHelper.buildWhereClause(userId, params);
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [total, payments] = await Promise.all([
            db_1.default.payment.count({ where }),
            db_1.default.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    order: {
                        include: {
                            pickup_request: {
                                include: {
                                    customer_address: true,
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return {
            data: payments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    static async getPaymentStats(userId) {
        // Count orders that have at least one PAID payment
        const paidOrdersCount = await db_1.default.order.count({
            where: {
                pickup_request: { customer_id: userId },
                payment: { some: { status: 'PAID' } },
            },
        });
        // For other statuses, we can still defer to payment counts or align similarly.
        // However, given the requirement is likely "Number of Successful Transactions",
        // matching the order count is the most robust fix.
        // We can also replicate the grouping for PENDING/FAILED if needed,
        // but let's keep the original grouping for those to minimize disruption,
        // only overriding the PAID count.
        const stats = await db_1.default.payment.groupBy({
            by: ['status'],
            where: {
                order: {
                    pickup_request: {
                        customer_id: userId,
                    },
                },
            },
            _count: {
                _all: true,
            },
        });
        let pending = 0;
        let failed = 0;
        stats.forEach((stat) => {
            const count = stat._count._all;
            const status = stat.status;
            if (status === 'PENDING') {
                pending += count;
            }
            else if (['FAILED', 'EXPIRED', 'REFUNDED'].includes(status)) {
                failed += count;
            }
        });
        return {
            all: pending + paidOrdersCount + failed,
            PENDING: pending,
            PAID: paidOrdersCount,
            FAILED_GROUP: failed,
        };
    }
    static async createPayment(userId, orderId, paymentMethod) {
        const order = await db_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                pickup_request: true,
                payment: true,
                order_item: { include: { laundry_item: true } },
            },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        if (order.pickup_request.customer_id !== userId) {
            throw new Error('Forbidden');
        }
        const successPayment = order.payment.find((p) => p.status === 'PAID');
        if (successPayment || order.paid_at) {
            throw new Error('Order already paid');
        }
        // Calculate amount from order items if price_total is 0
        let amount = order.price_total;
        if (amount === 0 && order.order_item.length > 0) {
            amount = order.order_item.reduce((sum, item) => {
                var _a;
                const unitPrice = item.price || ((_a = item.laundry_item) === null || _a === void 0 ? void 0 : _a.price) || 0;
                return sum + unitPrice * item.qty;
            }, 0);
        }
        const payment = await db_1.default.payment.create({
            data: {
                order_id: orderId,
                amount: amount,
                method: paymentMethod || 'SIMULATION',
                status: 'PENDING',
                payment_ref: `REF-${Date.now()}`,
            },
        });
        return {
            paymentId: payment.id,
            amount: amount,
            snapToken: 'SIMULATED-SNAP-TOKEN-' + payment.id,
            redirectUrl: `${process.env.BASE_WEB_URL}/dashboard/payments/payment-gateway-mock?orderId=${orderId}&pickupId=${order.pickup_request.id}&paymentId=${payment.id}&amount=${amount}&method=${paymentMethod}`,
        };
    }
    static async handlePaymentWebhook(orderId, paymentId) {
        const order = await db_1.default.order.findUnique({
            where: { id: orderId },
            include: { payment: true },
        });
        if (!order)
            throw new Error('Order not found');
        let pendingPayment;
        if (paymentId) {
            pendingPayment = await db_1.default.payment.findUnique({
                where: { id: paymentId },
            });
            // Safety check: ensure it belongs to the order
            if (pendingPayment && pendingPayment.order_id !== orderId) {
                pendingPayment = null;
            }
        }
        else {
            pendingPayment = await db_1.default.payment.findFirst({
                where: { order_id: orderId, status: 'PENDING' },
            });
        }
        if (pendingPayment && pendingPayment.status === 'PENDING') {
            await db_1.default.payment.update({
                where: { id: pendingPayment.id },
                data: {
                    status: 'PAID',
                    paid_at: new Date(),
                },
            });
        }
        let updateData = {
            paid_at: new Date(),
        };
        if (order.status === 'IN_PACKING' || order.status === 'WAITING_PAYMENT') {
            if (order.status === 'WAITING_PAYMENT') {
                updateData.status = 'READY_FOR_DELIVERY';
                await db_1.default.driver_Task.create({
                    data: {
                        order_id: orderId,
                        task_type: 'DELIVERY',
                        status: 'AVAILABLE',
                    },
                });
            }
        }
        else if (order.status === 'CREATED') {
            // If order is just created (process starting), mark as PAID or IN_WASHING
            // Assuming 'PAID' is the safe next state before processing starts
            updateData.status = 'PAID';
        }
        await db_1.default.order.update({
            where: { id: orderId },
            data: updateData,
        });
        return { message: 'Payment success handled' };
    }
}
exports.PaymentService = PaymentService;
