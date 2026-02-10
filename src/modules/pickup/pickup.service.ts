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
  return prisma.$transaction(async (tx) => {
    // Append manual items to notes if any
    let finalNotes = data.notes || '';
    if (data.manualItems && data.manualItems.length > 0) {
      const manualItemsText = data.manualItems
        .map((item) => `${item.quantity}x ${item.name}`)
        .join(', ');
      finalNotes = finalNotes
        ? `${finalNotes}\n\nManual Items: ${manualItemsText}`
        : `Manual Items: ${manualItemsText}`;
    }

    const pickup = await tx.pickup_Request.create({
      data: {
        customer_id: data.customerId,
        address_id: data.addressId,
        schedulled_pickup_at: data.scheduledPickupAt,
        notes: finalNotes || undefined,
        assigned_outlet_id: assignedOutletId,
        status: 'WAITING_DRIVER',
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        customer_address: true,
        outlet: true,
      },
    });

    // Create Order if items are provided or just to initialize the order flow
    if ((data.items && data.items.length > 0) || finalNotes) {
      // Get outlet admin for this outlet
      const outletAdmin = await tx.staff.findFirst({
        where: {
          outlet_id: assignedOutletId,
          staff_type: 'OUTLET_ADMIN',
        },
        select: { staff_id: true },
      });

      if (!outletAdmin) {
        throw createCustomError(400, 'No outlet admin found for this outlet');
      }

      const orderData: Parameters<typeof tx.order.create>[0]['data'] = {
        pickup_request_id: pickup.id,
        outlet_id: assignedOutletId,
        outlet_admin_id: outletAdmin.staff_id,
        total_weight: 0, // Initial 0
        price_total: 0, // Initial 0
        status: 'CREATED',
      };

      // Only add order items if they exist
      if (data.items && data.items.length > 0) {
        orderData.order_item = {
          create: data.items.map((item) => ({
            laundry_item_id: item.laundryItemId,
            qty: item.qty,
          })),
        };
      }

      await tx.order.create({ data: orderData });
    }

    return pickup;
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
      order: {
        include: {
          order_item: {
            include: {
              laundry_item: true,
            },
          },
          payment: true,
        },
      },
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
