import { Router } from 'express';
import {
  getStationTasks,
  claimTask,
  processTask,
  requestBypass,
  getWorkerHistory,
  getTaskDetail,
} from '../controllers/worker.controller';
import { authMiddleware } from '../common/middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/station/tasks', getStationTasks);
router.post('/station/tasks/:taskId/claim', claimTask);
router.post('/station/tasks/:taskId/process', processTask);
router.post('/station/tasks/:taskId/bypass', requestBypass);
router.get('/station/tasks/:taskId', getTaskDetail);
router.get('/history', getWorkerHistory);

export const WorkerRoutes = router;
