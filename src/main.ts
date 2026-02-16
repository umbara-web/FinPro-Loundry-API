import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { PORT, BASE_WEB_URL } from './configs/env.config';
import { prisma } from './admin/lib/prisma';
import { logger } from './lib/logger';

// Middlewares
import errorMiddleware from './common/middlewares/error.middleware';
import { authenticateJWT, requireSuperAdmin } from './admin/middleware/auth.middleware';

// Routers
import router from './routes'; // Generic /api routers
import { initOrderCron } from './modules/order/order.cron';

// Admin Routers
import addressRouter from './admin/router/address.router';
import itemRouter from './admin/router/item.router';
import outletRouter from './admin/router/outlet.router';
import workerRouter from './admin/router/worker.router';
import orderRouter from './admin/router/order.router';

const app = express();
const SERVER_PORT = PORT || 8000;

// --- Global Middleware ---

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: BASE_WEB_URL || 'http://localhost:3000', // Fallback to localhost
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

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
app.use('/api/addresses', authenticateJWT, requireSuperAdmin, addressRouter);
app.use('/api/items', authenticateJWT, requireSuperAdmin, itemRouter);
app.use('/api/outlets', authenticateJWT, outletRouter);
app.use('/api/workers', authenticateJWT, workerRouter);
app.use('/api/admin/orders', authenticateJWT, orderRouter); // Renamed to avoid collision

// 2. Generic API Router
// Handles other modules like /auth, /users, etc.
app.use('/', router);

// 3. Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Server is running', service: 'FinnPro Laundry API' });
});

// --- Error Handling ---

// Application-level error handler
app.use(errorMiddleware);

// Fallback for unhandled routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// --- Server Startup ---

async function startServer() {
  try {
    // verify database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // start cron jobs
    initOrderCron();
    console.log('⏰ Order cron job initialized');

    app.listen(SERVER_PORT, () => {
      logger.info(`🚀 Server is running on port ${SERVER_PORT}`);
      console.log(`📡 API endpoint: http://localhost:${SERVER_PORT}/api`);
      console.log(`📡 Admin endpoint: http://localhost:${SERVER_PORT}/api/admin/orders`);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your DATABASE_URL in .env file');
    process.exit(1); // Exit if DB connection fails
  }
}

// Start the server
startServer();