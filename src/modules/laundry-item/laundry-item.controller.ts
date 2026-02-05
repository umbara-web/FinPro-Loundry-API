import { Request, Response, NextFunction } from 'express';
import { LaundryItemService } from './laundry-item.service';

export class LaundryItemController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const items = await LaundryItemService.getAll();
      res.status(200).json({
        message: 'Laundry items retrieved successfully',
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
}
