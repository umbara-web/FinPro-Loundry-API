"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterRoutes = void 0;
const express_1 = require("express");
const db_1 = __importDefault(require("../configs/db"));
const router = (0, express_1.Router)();
// GET /master/laundry-items - Get all laundry item types
router.get('/laundry-items', async (req, res) => {
    try {
        const items = await db_1.default.laundry_Item.findMany({
            orderBy: { name: 'asc' },
        });
        res.json({ data: items });
    }
    catch (error) {
        console.error('Error fetching laundry items:', error);
        res.status(500).json({ message: 'Failed to fetch laundry items' });
    }
});
exports.MasterRoutes = router;
