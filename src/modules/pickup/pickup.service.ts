import prisma from '../../configs/db';
import { createCustomError } from '../../common/utils/customError';
import { CreatePickupInput } from './pickup.types';
import { PickupGeoHelper } from './pickup.geo.helper';
import { PickupValidationHelper } from './pickup.validation';

export { findNearestOutletByCoordinates } from './pickup.geo.helper';

export async function createPickupRequest(data: CreatePickupInput) {
  const address = await PickupValidationHelper.validateCustomerAndAddress(
    data.customerId,
    data.addressId
  );

  if (!address.lat || !address.long) {
    throw createCustomError(400, 'Address coordinates missing');
  }

  const assignedOutletId = await PickupGeoHelper.getOrValidateOutlet(
    data.outletId,
    address.lat,
    address.long
  );

  return createPickupInDb(data, assignedOutletId);
}

function createPickupInDb(data: CreatePickupInput, assignedOutletId: string) {
  return prisma.pickup_Request.create({
    data: {
      customer_id: data.customerId,
      address_id: data.addressId,
      schedulled_pickup_at: data.scheduledPickupAt,
      notes: data.notes,
      assigned_outlet_id: assignedOutletId,
      status: 'WAITING_DRIVER',
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      customer_address: true,
      outlet: true,
    },
  });
}

export async function getPickupRequestsByCustomer(customerId: string) {
  return prisma.pickup_Request.findMany({
    where: { customer_id: customerId },
    include: {
      customer_address: true,
      outlet: { select: { id: true, name: true, address: true } },
      driver: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { created_at: 'desc' },
  });
}

async function fetchPickupRequest(id: string) {
  const pickupRequest = await prisma.pickup_Request.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      customer_address: true,
      outlet: true,
      driver: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!pickupRequest) throw createCustomError(404, 'Pickup request not found');
  return pickupRequest;
}

export async function getPickupRequestById(id: string, customerId?: string) {
  const pickupRequest = await fetchPickupRequest(id);
  PickupValidationHelper.validatePickupOwnership(
    pickupRequest.customer_id,
    customerId
  );
  return pickupRequest;
}

export async function cancelPickupRequest(id: string, customerId: string) {
  const pickupRequest = await prisma.pickup_Request.findUnique({
    where: { id },
  });
  if (!pickupRequest) throw createCustomError(404, 'Pickup request not found');

  PickupValidationHelper.validateCancellable(pickupRequest, customerId);

  return prisma.pickup_Request.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });
}
