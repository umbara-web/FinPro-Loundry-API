import { Router, Request, Response, NextFunction } from 'express';
import * as outletController from '../controllers/outlet.controller';

const router = Router();

// Allow both SUPER_ADMIN and OUTLET_ADMIN to manage outlets
const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'OUTLET_ADMIN') {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
    }
    next();
};

router.get('/', requireAdminRole, outletController.getOutlets);
router.get('/:id', outletController.getOutletById);
router.post('/', requireAdminRole, outletController.createOutlet);
router.put('/:id', requireAdminRole, outletController.updateOutlet);
router.delete('/:id', requireAdminRole, outletController.deleteOutlet);

export default router;
