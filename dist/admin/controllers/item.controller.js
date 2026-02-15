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
exports.deleteItem = exports.updateItem = exports.createItem = exports.getItemById = exports.getItems = void 0;
const client_1 = require("@prisma/client");
const itemService = __importStar(require("../services/item.service"));
const getItems = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        const items = await itemService.getItems(search, category, status);
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getItems = getItems;
const getItemById = async (req, res) => {
    try {
        const item = await itemService.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getItemById = getItemById;
const createItem = async (req, res) => {
    try {
        const rawData = req.body;
        const mapCategory = (cat) => {
            switch (cat) {
                case 'Cuci Setrika': return client_1.ItemCategory.CUCI_SETRIKA;
                case 'Satuan': return client_1.ItemCategory.SATUAN;
                case 'Dry Clean': return client_1.ItemCategory.DRY_CLEAN;
                default: return client_1.ItemCategory.CUCI_SETRIKA;
            }
        };
        const mapUnit = (unit) => {
            switch (unit) {
                case 'kg': return client_1.ItemUnit.KG;
                case 'pcs': return client_1.ItemUnit.PCS;
                case 'm²': return client_1.ItemUnit.M2;
                default: return client_1.ItemUnit.PCS;
            }
        };
        const mapStatus = (status) => {
            return status === 'Aktif' ? client_1.ItemStatus.ACTIVE : client_1.ItemStatus.INACTIVE;
        };
        const data = Object.assign({ name: rawData.name, price: rawData.price ? parseInt(rawData.price, 10) : 0, category: mapCategory(rawData.category), unit: mapUnit(rawData.unit), status: mapStatus(rawData.status) }, (rawData.imageUrl ? { imageUrl: rawData.imageUrl } : {}));
        const item = await itemService.createItem(data);
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createItem = createItem;
const updateItem = async (req, res) => {
    try {
        const rawData = req.body;
        const mapCategory = (cat) => {
            if (!cat)
                return undefined;
            if (cat === 'Cuci Setrika')
                return client_1.ItemCategory.CUCI_SETRIKA;
            if (cat === 'Satuan')
                return client_1.ItemCategory.SATUAN;
            if (cat === 'Dry Clean')
                return client_1.ItemCategory.DRY_CLEAN;
            return undefined;
        };
        const mapUnit = (unit) => {
            if (!unit)
                return undefined;
            if (unit === 'kg')
                return client_1.ItemUnit.KG;
            if (unit === 'pcs')
                return client_1.ItemUnit.PCS;
            if (unit === 'm²')
                return client_1.ItemUnit.M2;
            return undefined;
        };
        const mapStatus = (status) => {
            if (!status)
                return undefined;
            if (status === 'Aktif' || status === 'ACTIVE')
                return client_1.ItemStatus.ACTIVE;
            return client_1.ItemStatus.INACTIVE;
        };
        const data = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (rawData.name !== undefined ? { name: rawData.name } : {})), (rawData.price !== undefined ? { price: parseInt(rawData.price, 10) } : {})), (rawData.category !== undefined ? { category: mapCategory(rawData.category) } : {})), (rawData.unit !== undefined ? { unit: mapUnit(rawData.unit) } : {})), (rawData.status !== undefined ? { status: mapStatus(rawData.status) } : {})), (rawData.imageUrl !== undefined ? { imageUrl: rawData.imageUrl } : {}));
        const item = await itemService.updateItem(req.params.id, data);
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateItem = updateItem;
const deleteItem = async (req, res) => {
    try {
        await itemService.deleteItem(req.params.id);
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.deleteItem = deleteItem;
