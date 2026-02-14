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
exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddressById = exports.getAddresses = void 0;
const addressService = __importStar(require("../services/address.service"));
const getAddresses = async (req, res) => {
    try {
        // For now, we accept userId as a query param or assume it comes from auth middleware later
        const userId = req.query.userId;
        const addresses = await addressService.getAddresses(userId);
        res.json(addresses);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAddresses = getAddresses;
const getAddressById = async (req, res) => {
    try {
        const address = await addressService.getAddressById(req.params.id);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAddressById = getAddressById;
const createAddress = async (req, res) => {
    try {
        const address = await addressService.createAddress(req.body);
        res.status(201).json(address);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res) => {
    try {
        const address = await addressService.updateAddress(req.params.id, req.body);
        res.json(address);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    try {
        await addressService.deleteAddress(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteAddress = deleteAddress;
