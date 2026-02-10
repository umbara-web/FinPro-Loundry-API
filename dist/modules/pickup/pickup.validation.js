"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PickupValidationHelper = void 0;
const db_1 = __importDefault(require("../../configs/db"));
const customError_1 = require("../../common/utils/customError");
class PickupValidationHelper {
    static async validateCustomer(customerId) {
        const customer = await db_1.default.user.findUnique({
            where: { id: customerId },
        });
        if (!customer)
            throw (0, customError_1.createCustomError)(404, 'Customer not found');
        return customer;
    }
    static async validateAddress(addressId, customerId) {
        const address = await db_1.default.customer_Address.findFirst({
            where: { id: addressId, customer_id: customerId },
        });
        if (!address) {
            throw (0, customError_1.createCustomError)(404, 'Address not found or does not belong to customer');
        }
        return address;
    }
    static async validateCustomerAndAddress(customerId, addressId) {
        await this.validateCustomer(customerId);
        return this.validateAddress(addressId, customerId);
    }
    static validatePickupOwnership(pickupCustomerId, customerId) {
        if (customerId && pickupCustomerId !== customerId) {
            throw (0, customError_1.createCustomError)(403, "You don't have access to this pickup request");
        }
    }
    static validateCancellable(pickupRequest, customerId) {
        if (pickupRequest.customer_id !== customerId) {
            throw (0, customError_1.createCustomError)(403, "You don't have access to this pickup request");
        }
        if (pickupRequest.status !== 'WAITING_DRIVER') {
            throw (0, customError_1.createCustomError)(400, 'Cannot cancel pickup request that is already in progress');
        }
    }
}
exports.PickupValidationHelper = PickupValidationHelper;
