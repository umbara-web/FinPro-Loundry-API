"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrder = exports.createOrder = exports.createWalkInOrder = exports.getOrderById = exports.getAllOrders = void 0;
const prisma_1 = require("../lib/prisma");
const getAllOrders = async (outletId) => {
    return await prisma_1.prisma.order.findMany({
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
exports.getAllOrders = getAllOrders;
const getOrderById = async (id) => {
    return await prisma_1.prisma.order.findUnique({
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
exports.getOrderById = getOrderById;
const createWalkInOrder = async (data) => {
    const { customerName, phone, serviceName, items, quantity, weight, assignedStaffName, outletId } = data;
    return await prisma_1.prisma.$transaction(async (tx) => {
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
                    password: await Promise.resolve().then(() => __importStar(require('bcrypt'))).then(b => b.hash('123456', 10)), // Default password
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
        const outletAdminId = (outletAdminStaff === null || outletAdminStaff === void 0 ? void 0 : outletAdminStaff.staff_id) || customer.id; // Fallback (dangerous but avoids crash if no admin)
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
exports.createWalkInOrder = createWalkInOrder;
const createOrder = async (data) => {
    return await prisma_1.prisma.order.create({
        data,
    });
};
exports.createOrder = createOrder;
const updateOrder = async (id, data) => {
    return await prisma_1.prisma.order.update({
        where: { id },
        data,
    });
};
exports.updateOrder = updateOrder;
const deleteOrder = async (id) => {
    return await prisma_1.prisma.order.delete({
        where: { id },
    });
};
exports.deleteOrder = deleteOrder;
