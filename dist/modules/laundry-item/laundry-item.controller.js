"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaundryItemController = void 0;
const laundry_item_service_1 = require("./laundry-item.service");
class LaundryItemController {
    static async getAll(req, res, next) {
        try {
            const items = await laundry_item_service_1.LaundryItemService.getAll();
            res.status(200).json({
                message: 'Laundry items retrieved successfully',
                data: items,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LaundryItemController = LaundryItemController;
