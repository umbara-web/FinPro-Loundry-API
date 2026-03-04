import { Router } from 'express';
import { PickupController } from './pickup.controller';
import {
  authMiddleware,
  roleGuard,
  verificationGuard,
} from '../../common/middlewares/auth.middleware';
import { validateBody } from '../../common/middlewares/validate.middleware';
import { createPickupSchema } from './pickup.schemas';

const pickupRouter = Router();

// GET /api/pickup/nearest-outlet - Find nearest outlet by coordinates
pickupRouter.get(
  '/nearest-outlet',
  authMiddleware,
  roleGuard(['CUSTOMER']),
  verificationGuard,
  PickupController.findNearestOutlet
);

// POST /api/pickup - Create new pickup request
pickupRouter.post(
  '/',
  authMiddleware,
  roleGuard(['CUSTOMER']),
  verificationGuard,
  validateBody(createPickupSchema),
  PickupController.createPickup
);

// GET /api/pickup - Get all my pickup requests
pickupRouter.get(
  '/',
  authMiddleware,
  roleGuard(['CUSTOMER']),
  verificationGuard,
  PickupController.getMyPickups
);

// GET /api/pickup/:id - Get specific pickup request
pickupRouter.get(
  '/:id',
  authMiddleware,
  roleGuard(['CUSTOMER']),
  verificationGuard,
  PickupController.getPickupById
);

// PUT /api/pickup/:id/cancel - Cancel pickup request
pickupRouter.put(
  '/:id/cancel',
  authMiddleware,
  roleGuard(['CUSTOMER']),
  verificationGuard,
  PickupController.cancelPickup
);

export default pickupRouter;
