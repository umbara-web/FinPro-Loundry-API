import { Request, Response, NextFunction } from 'express';
import {
  PickupService,
  findNearestOutletByCoordinates,
} from './pickup.service';
import { sendResponse } from '../../core/utils/response.util';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

export class PickupController {
  static async findNearestOutlet(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { lat, long } = req.query;
      if (!lat || !long) {
        throw new BadRequestError('lat and long are required');
      }

      const result = await findNearestOutletByCoordinates(
        lat as string,
        long as string
      );
      return sendResponse(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  static async createPickup(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) throw new BadRequestError('Unauthorized');

      const {
        addressId,
        schedulledPickupAt,
        notes,
        outletId,
        items,
        manualItems,
      } = req.body;

      const result = await PickupService.createPickupRequest({
        customerId,
        addressId,
        scheduledPickupAt: new Date(schedulledPickupAt),
        notes,
        outletId,
        items,
        manualItems,
      });

      return sendResponse(
        res,
        201,
        'Pickup request created successfully',
        result
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMyPickups(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) throw new BadRequestError('Unauthorized');

      const result =
        await PickupService.getPickupRequestsByCustomer(customerId);
      return sendResponse(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  static async getPickupById(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.userId;
      const { id } = req.params;

      const result = await PickupService.getPickupRequestById(id, customerId);
      return sendResponse(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  static async cancelPickup(req: Request, res: Response, next: NextFunction) {
    try {
      const customerId = (req as any).user?.userId;
      if (!customerId) throw new BadRequestError('Unauthorized');

      const { id } = req.params;
      const result = await PickupService.cancelPickupRequest(id, customerId);

      return sendResponse(
        res,
        200,
        'Pickup request cancelled successfully',
        result
      );
    } catch (error) {
      next(error);
    }
  }
}
