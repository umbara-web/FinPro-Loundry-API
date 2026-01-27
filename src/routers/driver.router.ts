import { Router } from "express";
import { 
    getAvailablePickups, 
    acceptPickup, 
    updatePickupStatus, 
    getAvailableDeliveries, 
    acceptDelivery, 
    updateDeliveryStatus 
} from "../controllers/driver.controller";
import { authMiddleware } from "../common/middlewares/auth.middleware"; 

const router = Router();

router.use(authMiddleware);

router.get("/pickups", getAvailablePickups);
router.post("/pickups/:requestId/accept", acceptPickup);
router.patch("/pickups/:requestId/status", updatePickupStatus);

router.get("/deliveries", getAvailableDeliveries);
router.post("/deliveries/:orderId/accept", acceptDelivery);
router.patch("/deliveries/:taskId/status", updateDeliveryStatus);

export const DriverRoutes = router;
