"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_config_1 = require("./configs/env.config");
const error_middleware_1 = __importDefault(require("./common/middlewares/error.middleware"));
const routes_1 = __importDefault(require("./routes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const order_cron_1 = require("./modules/order/order.cron");
const dotenv_1 = __importDefault(require("dotenv"));
const address_router_1 = __importDefault(require("./admin/router/address.router"));
const item_router_1 = __importDefault(require("./admin/router/item.router"));
const outlet_router_1 = __importDefault(require("./admin/router/outlet.router"));
const worker_router_1 = __importDefault(require("./admin/router/worker.router"));
const order_router_1 = __importDefault(require("./admin/router/order.router"));
const prisma_1 = require("./admin/lib/prisma");
const app = (0, express_1.default)();
// middleware
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
app.use((0, cors_1.default)({
    origin: env_config_1.BASE_WEB_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public'))); // Serve public folder
// routers
app.use('/api', routes_1.default);
// error middleware
app.use(error_middleware_1.default);
// start cron jobs
(0, order_cron_1.initOrderCron)();
const logger_1 = require("./lib/logger");
app.listen(env_config_1.PORT, () => {
    logger_1.logger.info(`Server started on port ${env_config_1.PORT}`);
});
dotenv_1.default.config();
// Middleware - CORS harus diletakkan sebelum middleware lainnya
app.use((0, cors_1.default)({
    origin: true, // Allow all origins (untuk development), bisa diubah ke array spesifik untuk production
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Body parser middleware - dengan limit yang lebih besar dan error handling
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Middleware untuk logging request (untuk debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        console.log('Request body:', req.body);
    }
    next();
});
// Routes
app.use('/api/addresses', address_router_1.default);
app.use('/api/items', item_router_1.default);
app.use('/api/outlets', outlet_router_1.default);
app.use('/api/workers', worker_router_1.default);
app.use('/api/orders', order_router_1.default);
// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Server is running' });
});
// Error handling middleware untuk JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && 'body' in err) {
        console.error('JSON parsing error:', err);
        return res.status(400).json({
            error: 'Format JSON tidak valid. Pastikan data yang dikirim dalam format JSON yang benar.'
        });
    }
    console.error('Unhandled error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
        error: 'Terjadi kesalahan pada server',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
// Test database connection on startup
async function startServer() {
    try {
        // Test Prisma connection
        await prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        console.error('Please check your DATABASE_URL in .env file');
    }
    app.listen(8000, () => {
        console.log('🚀 Server is running on port 8000');
        console.log('📡 API endpoint: http://localhost:8000/api/addresses');
    });
}
startServer();
