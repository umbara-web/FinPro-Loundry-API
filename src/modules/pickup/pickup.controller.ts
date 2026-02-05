import { Request, Response, NextFunction } from 'express';
import {
  createPickupRequest,
  getPickupRequestsByCustomer,
  getPickupRequestById,
  cancelPickupRequest,
  findNearestOutletByCoordinates,
} from './pickup.service';

export async function findNearestOutlet(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { lat, long } = req.query;
    if (!lat || !long)
      return res.status(400).json({ error: 'lat and long are required' });

    const result = await findNearestOutletByCoordinates(
      lat as string,
      long as string
    );
    res.status(200).json({ message: 'OK', data: result });
  } catch (error) {
    next(error);
  }
}

export async function createPickup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const {
      addressId,
      schedulledPickupAt,
      notes,
      outletId,
      items,
      manualItems,
    } = req.body;
    const result = await createPickupRequest({
      customerId,
      addressId,
      scheduledPickupAt: new Date(schedulledPickupAt),
      notes,
      outletId,
      items,
      manualItems,
    });

    res
      .status(201)
      .json({ message: 'Pickup request created successfully', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMyPickups(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const result = await getPickupRequestsByCustomer(customerId);
    res.status(200).json({ message: 'OK', data: result });
  } catch (error) {
    next(error);
  }
}

export async function getPickupById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.user?.userId;
    const { id } = req.params;

    const result = await getPickupRequestById(id, customerId);
    res.status(200).json({ message: 'OK', data: result });
  } catch (error) {
    next(error);
  }
}

export async function cancelPickup(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.user?.userId;
    if (!customerId) return res.status(401).json({ error: 'Unauthorized' });

    const { id } = req.params;
    const result = await cancelPickupRequest(id, customerId);

    res
      .status(200)
      .json({ message: 'Pickup request cancelled successfully', data: result });
  } catch (error) {
    next(error);
  }
}
