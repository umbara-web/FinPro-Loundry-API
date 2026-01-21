import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { PORT, BASE_WEB_URL } from './configs/env.config';
import errorMiddleware from './common/middlewares/error.middleware';
import router from './routes';
import cookieParser from 'cookie-parser';

import path from 'path';
// import { initOrderCron } from './modules/order/order.cron';

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

// initOrderCron();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
