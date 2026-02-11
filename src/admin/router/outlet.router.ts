import { Router } from 'express';
import * as outletController from '../controllers/outlet.controller';

const router = Router();

router.get('/', outletController.getOutlets);
router.get('/:id', outletController.getOutletById);
router.post('/', outletController.createOutlet);
router.put('/:id', outletController.updateOutlet);
router.delete('/:id', outletController.deleteOutlet);

export default router;
