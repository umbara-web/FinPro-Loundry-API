import { Request, Response, NextFunction } from "express";
import {
  getAvailablePickupsService,
  acceptPickupService,
  updatePickupStatusService,
  getAvailableDeliveriesService,
  acceptDeliveryService,
  updateDeliveryStatusService,
  getActiveJobService,
  getDriverHistoryService,
  getPickupByIdService,
  getDeliveryByIdService,
} from "../services/driver.service";

export const getAvailablePickups = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");

    const result = await getAvailablePickupsService(driver_id);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptPickup = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");
    const { requestId } = req.params;

    const result = await acceptPickupService(driver_id, requestId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updatePickupStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const result = await updatePickupStatusService(requestId, status);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getAvailableDeliveries = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");

    const result = await getAvailableDeliveriesService(driver_id);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const acceptDelivery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");
    const { orderId } = req.params;

    const result = await acceptDeliveryService(driver_id, orderId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const result = await updateDeliveryStatusService(taskId, status);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getActiveJob = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");

    const result = await getActiveJobService(driver_id);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const getDriverHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const date = req.query.date as string | undefined;

    const result = await getDriverHistoryService(driver_id, page, limit, date);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getPickupById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");
    const { pickupId } = req.params;

    const result = await getPickupByIdService(driver_id, pickupId);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const driver_id = req.user?.userId;
    if (!driver_id) throw new Error("Unauthorized");
    const { taskId } = req.params;

    const result = await getDeliveryByIdService(driver_id, taskId);
    res.status(200).send({ data: result });
  } catch (error) {
    next(error);
  }
};
