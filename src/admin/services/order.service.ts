import { prisma } from '../lib/prisma';
import { Prisma } from '@prisma/client';

export const getAllOrders = async (outletId?: string) => {
    return await prisma.order.findMany({
        where: outletId ? { outlet_id: outletId } : {},
        include: {
            pickup_request: {
                include: {
                    customer: true,
                    customer_address: true,
                },
            },
            outlet: true,
            outlet_admin: true,
            station_task: {
                include: {
                    worker: true
                },
                orderBy: { started_at: 'desc' },
                take: 1
            },
            order_item: {
                include: {
                    laundry_item: true,
                },
            },
        },
        orderBy: { created_at: 'desc' },
    });
};

export const getOrderById = async (id: string) => {
    return await prisma.order.findUnique({
        where: { id },
        include: {
            pickup_request: {
                include: {
                    customer: true,
                    customer_address: true,
                },
            },
            outlet: true,
            outlet_admin: true,
            order_item: {
                include: {
                    laundry_item: true,
                },
            },
        },
    });
};

interface WalkInOrderData {
    customerName: string;
    phone: string;
    serviceName: string;
    items: string;
    quantity: number;
    weight: number;
    assignedStaffName?: string;
    outletId: string;
}

export const createWalkInOrder = async (data: WalkInOrderData) => {
    const { customerName, phone, serviceName, items, quantity, weight, assignedStaffName, outletId } = data;

    return await prisma.$transaction(async (tx) => {
        let customer = await tx.user.findFirst({
            where: { phone }
        });

        if (!customer) {
            const placeholderEmail = `${phone}@laundry.local`;
            customer = await tx.user.upsert({
                where: { email: placeholderEmail },
                update: {},
                create: {
                    name: customerName,
                    email: placeholderEmail,
                    password: await import('bcrypt').then(b => b.hash('123456', 10)), // Default password
                    phone: phone,
                    role: 'CUSTOMER',
                    lat: '0',
                    long: '0',
                    isVerified: true
                }
            });
        }

        let address = await tx.customer_Address.findFirst({
            where: { customer_id: customer.id, label: 'Walk-In' }
        });

        if (!address) {
            address = await tx.customer_Address.create({
                data: {
                    customer_id: customer.id,
                    label: 'Walk-In',
                    recipient_name: customerName,
                    recipient_phone: phone,
                    address: 'Walk-In Order',
                    city: 'Local',
                    postal_code: '00000',
                    lat: '0',
                    long: '0',
                    is_primary: false
                }
            });
        }

        const pickupRequest = await tx.pickup_Request.create({
            data: {
                customer_id: customer.id,
                address_id: address.id,
                schedulled_pickup_at: new Date(),
                assigned_outlet_id: outletId,
                status: 'ARRIVED_OUTLET',
                notes: 'Walk-in Order'
            }
        });

        let laundryItem = await tx.laundry_Item.findFirst({
            where: {
                name: { contains: serviceName, mode: 'insensitive' },
                status: 'ACTIVE'
            }
        });

        if (!laundryItem) {
            laundryItem = await tx.laundry_Item.findFirst({
                where: { status: 'ACTIVE' }
            });
        }

        if (!laundryItem) {
            throw new Error('No laundry services available');
        }

        const outletAdminStaff = await tx.staff.findFirst({
            where: { outlet_id: outletId, staff_type: 'OUTLET_ADMIN' },
            include: { staff: true }
        });

        const outletAdminId = outletAdminStaff?.staff_id || customer.id; // Fallback (dangerous but avoids crash if no admin)

        const order = await tx.order.create({
            data: {
                pickup_request_id: pickupRequest.id,
                outlet_id: outletId,
                outlet_admin_id: outletAdminId,
                total_weight: weight,
                price_total: laundryItem.price * (laundryItem.unit === 'KG' ? weight : quantity), // Simple calculation
                status: 'CREATED',
                paid_at: null
            }
        });

        await tx.order_Item.create({
            data: {
                order_id: order.id,
                laundry_item_id: laundryItem.id,
                itemName: laundryItem.name + (items ? ` (${items})` : ''),
                price: laundryItem.price,
                unit: laundryItem.unit,
                qty: quantity
            }
        });


        if (assignedStaffName) {
        }

        return order;
    });
};

export const createOrder = async (data: Prisma.OrderUncheckedCreateInput) => {
    return await prisma.order.create({
        data,
    });
};

export const updateOrder = async (id: string, data: Prisma.OrderUncheckedUpdateInput) => {
    return await prisma.order.update({
        where: { id },
        data,
    });
};

export const deleteOrder = async (id: string) => {
    return await prisma.order.delete({
        where: { id },
    });
};
