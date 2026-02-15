import { Router } from 'express';
import {
  getAttendanceReportController,
  getBypassRequests,
  handleBypassRequest,
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
  getAttendanceReportController,
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

export const OutletAdminRoutes = router;
