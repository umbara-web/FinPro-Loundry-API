import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PORT, BASE_WEB_URL } from './configs/env.config';
import errorMiddleware from './common/middlewares/error.middleware';
import router from './routes';
import cookieParser from 'cookie-parser';
import path from 'path';
import { initOrderCron } from './modules/order/order.cron';
import dotenv from 'dotenv';
import addressRouter from './admin/router/address.router';
import itemRouter from './admin/router/item.router';
import outletRouter from './admin/router/outlet.router';
import workerRouter from './admin/router/worker.router';
import orderRouter from './admin/router/order.router';
import { prisma } from './admin/lib/prisma';
import { authenticateJWT, requireSuperAdmin } from './admin/middleware/auth.middleware';


const app = express();

// middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: BASE_WEB_URL,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public'))); // Serve public folder

// routers
app.use('/api', router);

// error middleware
app.use(errorMiddleware);

// start cron jobs
initOrderCron();

import { logger } from './lib/logger';

app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});


dotenv.config();



app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    console.log('Request body:', req.body);
  }
  next();
});


app.use('/api/addresses', authenticateJWT, requireSuperAdmin, addressRouter);
app.use('/api/items', authenticateJWT, requireSuperAdmin, itemRouter);
app.use('/api/outlets', authenticateJWT, outletRouter);
app.use('/api/workers', authenticateJWT, workerRouter);
app.use('/api/orders', authenticateJWT, orderRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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


async function startServer() {
  try {

    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Please check your DATABASE_URL in .env file');
  }

  app.listen(8000, () => {
    console.log('🚀 Server is running on port 8000');
    console.log('📡 API endpoint: http://localhost:8000/api/addresses');
  });
}

// Force restart for CORS fix again
startServer();