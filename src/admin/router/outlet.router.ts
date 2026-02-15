import { Router } from 'express';
import * as outletController from '../controllers/outlet.controller';

const router = Router();

import { requireSuperAdmin } from '../middleware/auth.middleware';

router.get('/', requireSuperAdmin, outletController.getOutlets);
router.get('/:id', outletController.getOutletById); // Open to authenticateJWT, controller handles authorization
router.post('/', requireSuperAdmin, outletController.createOutlet);
router.put('/:id', requireSuperAdmin, outletController.updateOutlet);
router.delete('/:id', requireSuperAdmin, outletController.deleteOutlet);

export default router;
