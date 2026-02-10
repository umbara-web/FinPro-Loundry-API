"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPrimaryAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getUserAddresses = void 0;
const db_1 = __importDefault(require("../../configs/db"));
// Transform DB address to frontend format
function transformAddress(addr) {
    return {
        id: addr.id,
        label: addr.label,
        recipientName: addr.recipient_name,
        recipientPhone: addr.recipient_phone,
        fullAddress: addr.address,
        city: addr.city,
        postalCode: addr.postal_code,
        notes: addr.notes || '',
        latitude: parseFloat(addr.lat),
        longitude: parseFloat(addr.long),
        isPrimary: addr.is_primary || false,
        createdAt: addr.created_at,
        updatedAt: addr.updated_at,
    };
}
async function verifyOwnership(userId, addressId) {
    const address = await db_1.default.customer_Address.findFirst({
        where: { id: addressId, customer_id: userId },
    });
    if (!address)
        throw new Error('Alamat tidak ditemukan');
    return address;
}
async function unsetPrimaryAddresses(userId, excludeId) {
    await db_1.default.customer_Address.updateMany({
        where: Object.assign({ customer_id: userId, is_primary: true }, (excludeId && { id: { not: excludeId } })),
        data: { is_primary: false },
    });
}
const getUserAddresses = async (userId) => {
    const addresses = await db_1.default.customer_Address.findMany({
        where: { customer_id: userId },
        orderBy: [{ is_primary: 'desc' }, { created_at: 'desc' }],
    });
    return addresses.map(transformAddress);
};
exports.getUserAddresses = getUserAddresses;
const createAddress = async (userId, data) => {
    if (data.isPrimary)
        await unsetPrimaryAddresses(userId);
    const address = await db_1.default.customer_Address.create({
        data: {
            customer_id: userId,
            label: data.label,
            recipient_name: data.recipientName,
            recipient_phone: data.recipientPhone,
            address: data.fullAddress,
            city: data.city,
            postal_code: data.postalCode,
            notes: data.notes || null,
            lat: data.latitude.toString(),
            long: data.longitude.toString(),
            is_primary: data.isPrimary,
        },
    });
    return transformAddress(address);
};
exports.createAddress = createAddress;
const updateAddress = async (userId, addressId, data) => {
    await verifyOwnership(userId, addressId);
    if (data.isPrimary)
        await unsetPrimaryAddresses(userId, addressId);
    const updateData = {};
    if (data.label !== undefined)
        updateData.label = data.label;
    if (data.recipientName !== undefined)
        updateData.recipient_name = data.recipientName;
    if (data.recipientPhone !== undefined)
        updateData.recipient_phone = data.recipientPhone;
    if (data.fullAddress !== undefined)
        updateData.address = data.fullAddress;
    if (data.city !== undefined)
        updateData.city = data.city;
    if (data.postalCode !== undefined)
        updateData.postal_code = data.postalCode;
    if (data.notes !== undefined)
        updateData.notes = data.notes || null;
    if (data.latitude !== undefined)
        updateData.lat = data.latitude.toString();
    if (data.longitude !== undefined)
        updateData.long = data.longitude.toString();
    if (data.isPrimary !== undefined)
        updateData.is_primary = data.isPrimary;
    const address = await db_1.default.customer_Address.update({
        where: { id: addressId },
        data: updateData,
    });
    return transformAddress(address);
};
exports.updateAddress = updateAddress;
const deleteAddress = async (userId, addressId) => {
    const existingAddress = await verifyOwnership(userId, addressId);
    if (existingAddress.is_primary) {
        const otherCount = await db_1.default.customer_Address.count({
            where: { customer_id: userId, id: { not: addressId } },
        });
        if (otherCount > 0) {
            throw new Error('Tidak dapat menghapus alamat utama. Jadikan alamat lain sebagai utama terlebih dahulu.');
        }
    }
    await db_1.default.customer_Address.delete({ where: { id: addressId } });
};
exports.deleteAddress = deleteAddress;
const setPrimaryAddress = async (userId, addressId) => {
    await verifyOwnership(userId, addressId);
    await unsetPrimaryAddresses(userId);
    const address = await db_1.default.customer_Address.update({
        where: { id: addressId },
        data: { is_primary: true },
    });
    return transformAddress(address);
};
exports.setPrimaryAddress = setPrimaryAddress;
