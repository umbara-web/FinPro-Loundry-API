"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pickup_controller_1 = require("./pickup.controller");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const validate_middleware_1 = require("../../common/middlewares/validate.middleware");
const pickup_schemas_1 = require("./pickup.schemas");
const pickupRouter = (0, express_1.Router)();
// GET /api/pickup/nearest-outlet - Find nearest outlet by coordinates
pickupRouter.get('/nearest-outlet', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(['CUSTOMER']), auth_middleware_1.verificationGuard, pickup_controller_1.findNearestOutlet);
// POST /api/pickup - Create new pickup request
pickupRouter.post('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(['CUSTOMER']), auth_middleware_1.verificationGuard, (0, validate_middleware_1.validateBody)(pickup_schemas_1.createPickupSchema), pickup_controller_1.createPickup);
// GET /api/pickup - Get all my pickup requests
pickupRouter.get('/', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(['CUSTOMER']), auth_middleware_1.verificationGuard, pickup_controller_1.getMyPickups);
// GET /api/pickup/:id - Get specific pickup request
pickupRouter.get('/:id', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(['CUSTOMER']), auth_middleware_1.verificationGuard, pickup_controller_1.getPickupById);
// PUT /api/pickup/:id/cancel - Cancel pickup request
pickupRouter.put('/:id/cancel', auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(['CUSTOMER']), auth_middleware_1.verificationGuard, pickup_controller_1.cancelPickup);
exports.default = pickupRouter;
