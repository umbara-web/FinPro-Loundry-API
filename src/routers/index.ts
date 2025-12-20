import { Router } from 'express';

import authRouter from '../routers';

const router = Router();

router.use('/auth', authRouter);

export default router;
