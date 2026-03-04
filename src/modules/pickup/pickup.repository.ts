import { prisma } from '../../core/prisma/prisma.client';
import { CreatePickupInput } from './pickup.types';

export class PickupRepository {
  async getPickupRequestsByCustomer(customerId: string) {
    return await prisma.pickup_Request.findMany({
      where: { customer_id: customerId },
      include: {
        address: true,
        outlet: { select: { id: true, name: true, address: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPickupRequestById(id: string) {
    return await prisma.pickup_Request.findUnique({
      where: { id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true },
        },
        address: true,
        outlet: true,

        orders: {
          include: {
            order_items: {
              include: { laundry_item: true },
            },
            payments: true,
          },
        },
      },
    });
  }

  async createPickupWithOrder(
    data: CreatePickupInput,
    finalNotes: string,
    assignedOutletId: string
  ) {
    return await prisma.$transaction(async (tx) => {
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
          address: true,
          outlet: true,
        },
      });

      if ((data.items && data.items.length > 0) || finalNotes) {
        const outletAdmin = await tx.staff.findFirst({
          where: { outlet_id: assignedOutletId, staff_type: 'OUTLET_ADMIN' },
          select: { staff_id: true },
        });

        if (!outletAdmin) {
          throw new Error('No outlet admin found for this outlet');
        }

        const orderData: Parameters<typeof tx.order.create>[0]['data'] = {
          pickup_request_id: pickup.id,
          outlet_id: assignedOutletId,
          outlet_admin_id: outletAdmin.staff_id,
          total_weight: 0,
          price_total: 0,
          status: 'CREATED',
        };

        if (data.items && data.items.length > 0) {
          const laundryItemIds = [
            ...new Set(data.items.map((i) => i.laundryItemId)),
          ];
          const laundryItems = await tx.laundry_Item.findMany({
            where: { id: { in: laundryItemIds } },
            select: { id: true, name: true, price: true, unit: true },
          });
          const itemMap = new Map(laundryItems.map((li) => [li.id, li]));

          orderData.order_items = {
            create: data.items.map((item) => {
              const laundryItem = itemMap.get(item.laundryItemId);
              if (!laundryItem) {
                throw new Error(
                  `Laundry item not found: ${item.laundryItemId}`
                );
              }
              return {
                laundry_item_id: item.laundryItemId,
                itemName: laundryItem.name,
                price: laundryItem.price,
                unit: laundryItem.unit,
                qty: item.qty,
              };
            }),
          };
        }

        await tx.order.create({ data: orderData });
      }

      return pickup;
    });
  }

  async findPickupByIdOnly(id: string) {
    return await prisma.pickup_Request.findUnique({ where: { id } });
  }

  async cancelPickupRequest(id: string) {
    return await prisma.pickup_Request.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
