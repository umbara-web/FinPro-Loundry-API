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

export class DriverRouter {
  private router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.use(authMiddleware);
    
    // Pickups
    this.router.get("/pickups", getAvailablePickups);
    this.router.post("/pickups/:requestId/accept", acceptPickup);
    this.router.patch("/pickups/:requestId/status", updatePickupStatus);

    // Deliveries
    this.router.get("/deliveries", getAvailableDeliveries);
    this.router.post("/deliveries/:orderId/accept", acceptDelivery);
    this.router.patch("/deliveries/:taskId/status", updateDeliveryStatus);
  }

  getRouter(): Router {
    return this.router;
  }
}
