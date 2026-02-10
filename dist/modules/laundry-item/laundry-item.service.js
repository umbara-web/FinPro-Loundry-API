"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaundryItemService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
class LaundryItemService {
    static async getAll() {
        return db_1.default.laundry_Item.findMany({
            orderBy: { name: 'asc' },
        });
    }
}
exports.LaundryItemService = LaundryItemService;
