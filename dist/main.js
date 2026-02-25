"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables immediately
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const env_config_1 = require("./configs/env.config");
const prisma_1 = require("./admin/lib/prisma");
const logger_1 = require("./lib/logger");
// Middlewares
const error_middleware_1 = __importDefault(require("./common/middlewares/error.middleware"));
const auth_middleware_1 = require("./admin/middleware/auth.middleware");
// Routers
const routes_1 = __importDefault(require("./routes")); // Generic /api routers
const order_cron_1 = require("./modules/order/order.cron");
// Admin Routers
const address_router_1 = __importDefault(require("./admin/router/address.router"));
const item_router_1 = __importDefault(require("./admin/router/item.router"));
const outlet_router_1 = __importDefault(require("./admin/router/outlet.router"));
const worker_router_1 = __importDefault(require("./admin/router/worker.router"));
const order_router_1 = __importDefault(require("./admin/router/order.router"));
const app = (0, express_1.default)();
const SERVER_PORT = env_config_1.PORT || 8000;
// --- Global Middleware ---
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use((0, cors_1.default)({
    origin: env_config_1.NEXT_PUBLIC_WEB_URL || 'http://localhost:3000', // Fallback to localhost
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
// Request Logging Middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        // CAUTION: Avoid logging sensitive data in production
        // console.log('Request body:', req.body);
    }
    next();
});
// --- Routes Registration ---
// 1. Admin API Routes (Must be registered BEFORE generic /api router)
// These routes are specific and should take precedence.
app.use('/api/addresses', auth_middleware_1.authenticateJWT, auth_middleware_1.requireSuperAdmin, address_router_1.default);
app.use('/api/items', auth_middleware_1.authenticateJWT, auth_middleware_1.requireSuperAdmin, item_router_1.default);
app.use('/api/outlets', auth_middleware_1.authenticateJWT, outlet_router_1.default);
app.use('/api/workers', auth_middleware_1.authenticateJWT, worker_router_1.default);
app.use('/api/admin/orders', auth_middleware_1.authenticateJWT, order_router_1.default); // Renamed to avoid collision
// 2. Generic API Router
// Handles other modules like /auth, /users, etc.
app.use('/api', routes_1.default);
// 3. Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Server is running', service: 'FinnPro Laundry API' });
});
// --- Error Handling ---
// Application-level error handler
app.use(error_middleware_1.default);
// Fallback for unhandled routes (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// --- Server Startup ---
async function startServer() {
    try {
        // verify database connection
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
        // start cron jobs
        (0, order_cron_1.initOrderCron)();
        console.log('⏰ Order cron job initialized');
        app.listen(SERVER_PORT, () => {
            logger_1.logger.info(`🚀 Server is running on port ${SERVER_PORT}`);
            console.log(`📡 API endpoint: http://localhost:${SERVER_PORT}/api`);
            console.log(`📡 Admin endpoint: http://localhost:${SERVER_PORT}/api/admin/orders`);
        });
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('Please check your DATABASE_URL in .env file');
        process.exit(1); // Exit if DB connection fails
    }
}
// Start the server
startServer();
