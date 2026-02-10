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
exports.setPrimaryAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const addressService = __importStar(require("./address.service"));
const getAddresses = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const addresses = await addressService.getUserAddresses(userId);
        res.status(200).json(addresses);
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const data = req.body;
        const address = await addressService.createAddress(userId, data);
        res.status(201).json({
            message: 'Alamat berhasil ditambahkan',
            data: address,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const addressId = req.params.id;
        const data = req.body;
        const address = await addressService.updateAddress(userId, addressId, data);
        res.status(200).json({
            message: 'Alamat berhasil diperbarui',
            data: address,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const addressId = req.params.id;
        await addressService.deleteAddress(userId, addressId);
        res.status(200).json({
            message: 'Alamat berhasil dihapus',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAddress = deleteAddress;
const setPrimaryAddress = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const addressId = req.params.id;
        const address = await addressService.setPrimaryAddress(userId, addressId);
        res.status(200).json({
            message: 'Alamat utama berhasil diubah',
            data: address,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.setPrimaryAddress = setPrimaryAddress;
