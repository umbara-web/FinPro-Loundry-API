"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutletAdminRoutes = void 0;
const express_1 = require("express");
const outlet_admin_controller_1 = require("../controllers/outlet-admin.controller");
const auth_middleware_1 = require("../common/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/attendance-report", auth_middleware_1.authMiddleware, (0, auth_middleware_1.roleGuard)(["OUTLET_ADMIN"]), outlet_admin_controller_1.getAttendanceReportController);
exports.OutletAdminRoutes = router;
