import { Router } from 'express';
import { LaundryItemController } from './laundry-item.controller';

const LaundryItemRoutes = Router();

LaundryItemRoutes.get('/', LaundryItemController.getAll);

export { LaundryItemRoutes };
