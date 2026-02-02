import { Router } from "express";
import { 
    getAvailablePickups, 
    acceptPickup, 
    updatePickupStatus, 
    getAvailableDeliveries, 
    acceptDelivery, 
    updateDeliveryStatus,
    getActiveJob,
    getDriverHistory,
    getPickupById,
    getDeliveryById
} from "../controllers/driver.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware"; 

const router = Router();

router.use(authMiddleware);

// Active job and history
router.get("/active-job", getActiveJob);
router.get("/history", getDriverHistory);

// Pickup routes
router.get("/pickups", getAvailablePickups);
router.get("/pickups/:pickupId", getPickupById);
router.post("/pickups/:requestId/accept", acceptPickup);
router.patch("/pickups/:requestId/status", updatePickupStatus);

// Delivery routes
router.get("/deliveries", getAvailableDeliveries);
router.get("/deliveries/:taskId", getDeliveryById);
router.post("/deliveries/:orderId/accept", acceptDelivery);
router.patch("/deliveries/:taskId/status", updateDeliveryStatus);

export const DriverRoutes = router;

