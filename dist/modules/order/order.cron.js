"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initOrderCron = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const order_service_1 = require("./order.service");
const logger_1 = require("../../lib/logger");
const initOrderCron = () => {
    // Run every hour
    node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            logger_1.logger.info('Running auto-confirm orders job...');
            const count = await order_service_1.OrderService.autoConfirmOrders();
            if (count > 0) {
                logger_1.logger.info(`Auto-confirmed ${count} orders.`);
            }
            else {
                logger_1.logger.info('No orders to auto-confirm.');
            }
        }
        catch (error) {
            logger_1.logger.error('Error running auto-confirm orders job:', error.message || error);
        }
    });
    logger_1.logger.info('Order cron job initialized');
};
exports.initOrderCron = initOrderCron;
