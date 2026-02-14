"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatsHelper = void 0;
const db_1 = __importDefault(require("../../configs/db"));
class OrderStatsHelper {
    static async getStats(userId) {
        const stats = await db_1.default.pickup_Request.groupBy({
            by: ['status'],
            where: {
                customer_id: userId,
            },
            _count: {
                _all: true,
            },
        });
        let ongoing = 0;
        let delivery = 0;
        let completed = 0;
        let cancelled = 0;
        stats.forEach((stat) => {
            const count = stat._count._all;
            const status = stat.status;
            if ([
                'WAITING_DRIVER',
                'DRIVER_ASSIGNED',
                'PICKED_UP',
                'ARRIVED_OUTLET',
            ].includes(status)) {
                ongoing += count;
            }
            else if (status === 'CANCELLED') {
                cancelled += count;
            }
        });
        return {
            all: ongoing + delivery + completed + cancelled,
            ONGOING: ongoing,
            DELIVERY: delivery,
            COMPLETED: completed,
            CANCELLED: cancelled,
        };
    }
}
exports.OrderStatsHelper = OrderStatsHelper;
