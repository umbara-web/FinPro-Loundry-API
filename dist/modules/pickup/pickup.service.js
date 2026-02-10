"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNearestOutletByCoordinates = void 0;
exports.createPickupRequest = createPickupRequest;
exports.getPickupRequestsByCustomer = getPickupRequestsByCustomer;
exports.getPickupRequestById = getPickupRequestById;
exports.cancelPickupRequest = cancelPickupRequest;
const db_1 = __importDefault(require("../../configs/db"));
const customError_1 = require("../../common/utils/customError");
const pickup_geo_helper_1 = require("./pickup.geo.helper");
const pickup_validation_1 = require("./pickup.validation");
var pickup_geo_helper_2 = require("./pickup.geo.helper");
Object.defineProperty(exports, "findNearestOutletByCoordinates", { enumerable: true, get: function () { return pickup_geo_helper_2.findNearestOutletByCoordinates; } });
async function createPickupRequest(data) {
    const address = await pickup_validation_1.PickupValidationHelper.validateCustomerAndAddress(data.customerId, data.addressId);
    if (!address.lat || !address.long) {
        throw (0, customError_1.createCustomError)(400, 'Address coordinates missing');
    }
    const assignedOutletId = await pickup_geo_helper_1.PickupGeoHelper.getOrValidateOutlet(data.outletId, address.lat, address.long);
    return createPickupInDb(data, assignedOutletId);
}
function createPickupInDb(data, assignedOutletId) {
    return db_1.default.$transaction(async (tx) => {
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
                throw (0, customError_1.createCustomError)(400, 'No outlet admin found for this outlet');
            }
            const orderData = {
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
async function getPickupRequestsByCustomer(customerId) {
    return db_1.default.pickup_Request.findMany({
        where: { customer_id: customerId },
        include: {
            customer_address: true,
            outlet: { select: { id: true, name: true, address: true } },
            driver: { select: { id: true, name: true, phone: true } },
        },
        orderBy: { created_at: 'desc' },
    });
}
async function fetchPickupRequest(id) {
    const pickupRequest = await db_1.default.pickup_Request.findUnique({
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
    if (!pickupRequest)
        throw (0, customError_1.createCustomError)(404, 'Pickup request not found');
    return pickupRequest;
}
async function getPickupRequestById(id, customerId) {
    const pickupRequest = await fetchPickupRequest(id);
    pickup_validation_1.PickupValidationHelper.validatePickupOwnership(pickupRequest.customer_id, customerId);
    return pickupRequest;
}
async function cancelPickupRequest(id, customerId) {
    const pickupRequest = await db_1.default.pickup_Request.findUnique({
        where: { id },
    });
    if (!pickupRequest)
        throw (0, customError_1.createCustomError)(404, 'Pickup request not found');
    pickup_validation_1.PickupValidationHelper.validateCancellable(pickupRequest, customerId);
    return db_1.default.pickup_Request.update({
        where: { id },
        data: { status: 'CANCELLED' },
    });
}
