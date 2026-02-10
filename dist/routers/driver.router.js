"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverRoutes = void 0;
const express_1 = require("express");
const driver_controller_1 = require("../controllers/driver.controller");
const auth_middleware_1 = require("../common/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
// Active job and history
router.get("/active-job", driver_controller_1.getActiveJob);
router.get("/history", driver_controller_1.getDriverHistory);
// Pickup routes
router.get("/pickups", driver_controller_1.getAvailablePickups);
router.get("/pickups/:pickupId", driver_controller_1.getPickupById);
router.post("/pickups/:requestId/accept", driver_controller_1.acceptPickup);
router.patch("/pickups/:requestId/status", driver_controller_1.updatePickupStatus);
// Delivery routes
router.get("/deliveries", driver_controller_1.getAvailableDeliveries);
router.get("/deliveries/:taskId", driver_controller_1.getDeliveryById);
router.post("/deliveries/:orderId/accept", driver_controller_1.acceptDelivery);
router.patch("/deliveries/:taskId/status", driver_controller_1.updateDeliveryStatus);
exports.DriverRoutes = router;
