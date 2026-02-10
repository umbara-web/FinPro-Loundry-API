"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LaundryItemRoutes = void 0;
const express_1 = require("express");
const laundry_item_controller_1 = require("./laundry-item.controller");
const LaundryItemRoutes = (0, express_1.Router)();
exports.LaundryItemRoutes = LaundryItemRoutes;
LaundryItemRoutes.get('/', laundry_item_controller_1.LaundryItemController.getAll);
