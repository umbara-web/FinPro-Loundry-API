import { CreatePickupInput } from './pickup.types';
import { PickupGeoHelper } from './pickup.geo.helper';
import { PickupValidationHelper } from './pickup.validation';
import { PickupRepository } from './pickup.repository';
import { BadRequestError } from '../../core/exceptions/BadRequestError';
import { NotFoundError } from '../../core/exceptions/NotFoundError';

export { findNearestOutletByCoordinates } from './pickup.geo.helper';

export class PickupService {
  private static pickupRepository = new PickupRepository();

  static async createPickupRequest(data: CreatePickupInput) {
    const address = await PickupValidationHelper.validateCustomerAndAddress(
      data.customerId,
      data.addressId
    );

    if (!address.lat || !address.long) {
      throw new BadRequestError('Address coordinates missing');
    }

    const assignedOutletId = await PickupGeoHelper.getOrValidateOutlet(
      data.outletId,
      address.lat,
      address.long
    );

    let finalNotes = data.notes || '';
    if (data.manualItems && data.manualItems.length > 0) {
      const manualItemsText = data.manualItems
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(', ');
      finalNotes = finalNotes
        ? `${finalNotes}\n\nManual Items: ${manualItemsText}`
        : `Manual Items: ${manualItemsText}`;
    }

    try {
      return await this.pickupRepository.createPickupWithOrder(
        data,
        finalNotes,
        assignedOutletId
      );
    } catch (e: any) {
      throw new BadRequestError(e.message || 'Failed to create pickup request');
    }
  }

  static async getPickupRequestsByCustomer(customerId: string) {
    return await this.pickupRepository.getPickupRequestsByCustomer(customerId);
  }

  static async getPickupRequestById(id: string, customerId?: string) {
    const pickupRequest = await this.pickupRepository.getPickupRequestById(id);

    if (!pickupRequest) throw new NotFoundError('Pickup request not found');

    PickupValidationHelper.validatePickupOwnership(
      pickupRequest.customer_id,
      customerId
    );

    return pickupRequest;
  }

  static async cancelPickupRequest(id: string, customerId: string) {
    const pickupRequest = await this.pickupRepository.findPickupByIdOnly(id);

    if (!pickupRequest) throw new NotFoundError('Pickup request not found');

    PickupValidationHelper.validateCancellable(pickupRequest, customerId);

    return await this.pickupRepository.cancelPickupRequest(id);
  }
}
