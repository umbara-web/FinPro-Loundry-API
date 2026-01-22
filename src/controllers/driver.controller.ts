import { Request, Response, NextFunction } from "express";
import { 
    getAvailablePickupsService, 
    acceptPickupService, 
    updatePickupStatusService, 
    getAvailableDeliveriesService, 
    acceptDeliveryService, 
    updateDeliveryStatusService 
} from "../services/driver.service";

export const getAvailablePickups = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver_id = req.user?.id;
    if (!driver_id) throw new Error("Unauthorized");
    
    const result = await getAvailablePickupsService(driver_id);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptPickup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const driver_id = req.user?.id;
    if (!driver_id) throw new Error("Unauthorized");
    const { requestId } = req.params;

    const result = await acceptPickupService(driver_id, requestId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updatePickupStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body; 

        const result = await updatePickupStatusService(requestId, status);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

export const getAvailableDeliveries = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const driver_id = req.user?.id;
      if (!driver_id) throw new Error("Unauthorized");

      const result = await getAvailableDeliveriesService(driver_id);
      res.status(200).send({ data: result });
  } catch (error) {
      next(error);
  }
};

export const acceptDelivery = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const driver_id = req.user?.id;
        if (!driver_id) throw new Error("Unauthorized");
        const { orderId } = req.params;

        const result = await acceptDeliveryService(driver_id, orderId);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};

export const updateDeliveryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { taskId } = req.params; 
        const { status } = req.body; 

        const result = await updateDeliveryStatusService(taskId, status);
        res.status(200).send(result);
    } catch (error) {
        next(error);
    }
};
