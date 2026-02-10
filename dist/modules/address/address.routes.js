"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("./address.controller");
const validate_middleware_1 = require("../../common/middlewares/validate.middleware");
const address_schemas_1 = require("./address.schemas");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const addressRouter = (0, express_1.Router)();
// All routes require authentication
addressRouter.use(auth_middleware_1.authMiddleware);
// GET /api/users/addresses - Get all addresses for logged-in user
addressRouter.get('/', address_controller_1.getAddresses);
// POST /api/users/addresses - Create new address
addressRouter.post('/', (0, validate_middleware_1.validateBody)(address_schemas_1.createAddressSchema), address_controller_1.createAddress);
// PUT /api/users/addresses/:id - Update address
addressRouter.put('/:id', (0, validate_middleware_1.validateBody)(address_schemas_1.updateAddressSchema), address_controller_1.updateAddress);
// DELETE /api/users/addresses/:id - Delete address
addressRouter.delete('/:id', address_controller_1.deleteAddress);
// PATCH /api/users/addresses/:id/primary - Set as primary address
addressRouter.patch('/:id/primary', address_controller_1.setPrimaryAddress);
exports.default = addressRouter;
