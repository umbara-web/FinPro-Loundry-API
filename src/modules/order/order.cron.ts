import cron from 'node-cron';
import { OrderService } from './order.service';
import { logger } from '../../lib/logger';

export const initOrderCron = () => {
  // Run every hour
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running auto-confirm orders job...');
      const count = await OrderService.autoConfirmOrders();
      if (count > 0) {
        logger.info(`Auto-confirmed ${count} orders.`);
      } else {
        logger.info('No orders to auto-confirm.');
      }
    } catch (error: any) {
      logger.error(
        'Error running auto-confirm orders job:',
        error.message || error
      );
    }
  });

  logger.info('Order cron job initialized');
};
