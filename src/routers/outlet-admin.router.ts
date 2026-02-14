import { Router } from 'express';
import { getAttendanceReportController } from '../controllers/outlet-admin.controller';
import {
  authMiddleware,
  roleGuard,
} from '../common/middlewares/auth.middleware';

const router = Router();

router.get(
  '/attendance-report',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  getAttendanceReportController,
);

export const OutletAdminRoutes = router;
