import { Router } from 'express';
import * as workerController from '../controllers/worker.controller';

const router = Router();

router.get('/', workerController.getWorkers);
router.get('/:id', workerController.getWorkerById);
router.post('/', workerController.createWorker);
router.put('/:id', workerController.updateWorker);
router.delete('/:id', workerController.deleteWorker);

export default router;
