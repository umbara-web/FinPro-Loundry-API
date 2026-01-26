import prisma from '../../configs/db';
import { createCustomError } from '../../common/utils/customError';

export class PickupValidationHelper {
  static async validateCustomer(customerId: string) {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) throw createCustomError(404, 'Customer not found');
    return customer;
  }

  static async validateAddress(addressId: string, customerId: string) {
    const address = await prisma.customer_Address.findFirst({
      where: { id: addressId, customer_id: customerId },
    });
    if (!address) {
      throw createCustomError(
        404,
        'Address not found or does not belong to customer'
      );
    }
    return address;
  }

  static async validateCustomerAndAddress(
    customerId: string,
    addressId: string
  ) {
    await this.validateCustomer(customerId);
    return this.validateAddress(addressId, customerId);
  }

  static validatePickupOwnership(
    pickupCustomerId: string,
    customerId?: string
  ) {
    if (customerId && pickupCustomerId !== customerId) {
      throw createCustomError(
        403,
        "You don't have access to this pickup request"
      );
    }
  }

  static validateCancellable(
    pickupRequest: { status: string; customer_id: string },
    customerId: string
  ) {
    if (pickupRequest.customer_id !== customerId) {
      throw createCustomError(
        403,
        "You don't have access to this pickup request"
      );
    }
    if (pickupRequest.status !== 'WAITING_DRIVER') {
      throw createCustomError(
        400,
        'Cannot cancel pickup request that is already in progress'
      );
    }
  }
}
