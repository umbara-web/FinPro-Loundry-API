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
exports.deleteOutlet = exports.updateOutlet = exports.createOutlet = exports.getOutletById = exports.getOutlets = void 0;
const outletService = __importStar(require("../services/outlet.service"));
const getOutlets = async (req, res) => {
    try {
        const outlets = await outletService.getOutlets();
        res.json(outlets);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch outlets' });
    }
};
exports.getOutlets = getOutlets;
const getOutletById = async (req, res) => {
    try {
        const { id } = req.params;
        const outlet = await outletService.getOutletById(id);
        if (!outlet) {
            return res.status(404).json({ error: 'Outlet not found' });
        }
        res.json(outlet);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch outlet' });
    }
};
exports.getOutletById = getOutletById;
const createOutlet = async (req, res) => {
    try {
        console.log('Creating outlet with data:', req.body);
        const outlet = await outletService.createOutlet(req.body);
        res.status(201).json(outlet);
    }
    catch (error) {
        console.error('createOutlet error:', error);
        const errorMessage = error.message || 'Unknown error';
        res.status(500).json({
            error: 'Failed to create outlet',
            details: errorMessage,
            prismaError: error.code ? { code: error.code, meta: error.meta } : undefined
        });
    }
};
exports.createOutlet = createOutlet;
const updateOutlet = async (req, res) => {
    try {
        const { id } = req.params;
        const outlet = await outletService.updateOutlet(id, req.body);
        res.json(outlet);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update outlet' });
    }
};
exports.updateOutlet = updateOutlet;
const deleteOutlet = async (req, res) => {
    try {
        const { id } = req.params;
        await outletService.deleteOutlet(id);
        res.status(200).json({ message: 'Outlet deleted successfully' });
    }
    catch (error) {
        console.error('deleteOutlet error:', error);
        res.status(500).json({ error: 'Failed to delete outlet' });
    }
};
exports.deleteOutlet = deleteOutlet;
