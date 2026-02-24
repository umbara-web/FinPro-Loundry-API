import { Router } from 'express';
import {
  getAttendanceReportController,
  getBypassRequests,
  handleBypassRequest,
  getDashboardStats,
  processOrderController,
} from '../controllers/outlet-admin.controller';
import {
  authMiddleware,
  roleGuard,
} from '../common/middlewares/auth.middleware';

const router = Router();

router.get(
  '/attendance-report',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  getAttendanceReportController
);

router.get(
  '/bypass-requests',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  getBypassRequests
);

router.patch(
  '/bypass-requests/:requestId',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  handleBypassRequest
);

router.get(
  '/dashboard-stats',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  getDashboardStats
);

router.post(
  '/orders/:id/process',
  authMiddleware,
  roleGuard(['OUTLET_ADMIN']),
  processOrderController
);

export const OutletAdminRoutes = router;
