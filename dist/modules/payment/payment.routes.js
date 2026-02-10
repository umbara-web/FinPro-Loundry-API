"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const auth_middleware_1 = require("../../common/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.authMiddleware, payment_controller_1.getPaymentStats);
router.get('/', auth_middleware_1.authMiddleware, payment_controller_1.getPayments);
router.post('/create', auth_middleware_1.authMiddleware, payment_controller_1.createPayment);
router.post('/webhook', payment_controller_1.handlePaymentWebhook); // Webhook usually no auth or specific signature header check
exports.default = router;
