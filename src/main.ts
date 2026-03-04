import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

import { PORT, NEXT_PUBLIC_WEB_URL } from './configs/env.config';
import { prisma } from './admin/lib/prisma';
import { logger } from './lib/logger';

// Middlewares
import errorMiddleware from './common/middlewares/error.middleware';
import {
  authenticateJWT,
  requireSuperAdmin,
} from './admin/middleware/auth.middleware';

// --- Enterprise Namespace Routers ---
import customerRouter from './routers/customer.routes';
import adminRouter from './routers/admin.routes';
import posRouter from './routers/pos.routes';
import driverRouter from './routers/driver.routes';

import legacyRouter from './routes'; // Keeping old routes for backwards compatibility during transition
import { initOrderCron } from './modules/order/order.cron';

const app = express();
const SERVER_PORT = PORT || 8000;

// --- Global Middleware ---
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: NEXT_PUBLIC_WEB_URL || 'http://localhost:3000',
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
  next();
});

// --- Enterprise SaaS Namespace Routing ---
// These prefixes cleanly separate client requests and allow specific rate-limiting/security per client
app.use('/api/v1/customer', customerRouter); // Used by Customer Web/Mobile App
app.use('/api/v1/admin', authenticateJWT, adminRouter); // Used by SuperAdmin/Franchise Dashboard
app.use('/api/v1/pos', authenticateJWT, posRouter); // Used by Outlet Workers Tablet POS
app.use('/api/v1/driver', authenticateJWT, driverRouter); // Used by Delivery Drivers App

// --- Legacy API Router (For Backwards Compatibility) ---
// Note: Can be removed once React frontends are updated to call `/api/v1/customer/...`
app.use('/', legacyRouter);

// 3. Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Server is running',
    service: 'FinnPro Laundry Enterprise API',
  });
});

// --- Error Handling ---
app.use(errorMiddleware); // Replaced with our new Class-based exception handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// --- Server Startup ---
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    initOrderCron();
    console.log('⏰ Order cron job initialized');

    app.listen(SERVER_PORT, () => {
      logger.info(`🚀 Server is running on port ${SERVER_PORT}`);
      console.log(
        `📡 Customer App endpoint: http://localhost:${SERVER_PORT}/api/v1/customer`
      );
      console.log(
        `📡 Admin Dashboard endpoint: http://localhost:${SERVER_PORT}/api/v1/admin`
      );
      console.log(
        `📡 POS Endpoint: http://localhost:${SERVER_PORT}/api/v1/pos`
      );
    });
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

startServer();
