import { Router } from 'express';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setPrimaryAddress,
} from './address.controller';
import { validateBody } from '../../common/middlewares/validate.middleware';
import { createAddressSchema, updateAddressSchema } from './address.schemas';
import { authMiddleware } from '../../common/middlewares/auth.middleware';

const addressRouter = Router();

// All routes require authentication
addressRouter.use(authMiddleware);

// GET /api/users/addresses - Get all addresses for logged-in user
addressRouter.get('/', getAddresses);

// POST /api/users/addresses - Create new address
addressRouter.post('/', validateBody(createAddressSchema), createAddress);

// PUT /api/users/addresses/:id - Update address
addressRouter.put('/:id', validateBody(updateAddressSchema), updateAddress);

// DELETE /api/users/addresses/:id - Delete address
addressRouter.delete('/:id', deleteAddress);

// PATCH /api/users/addresses/:id/primary - Set as primary address
addressRouter.patch('/:id/primary', setPrimaryAddress);

export default addressRouter;
