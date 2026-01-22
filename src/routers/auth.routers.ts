import { Router } from 'express';

const authRouter = Router();

authRouter.use('/login');
authRouter.use('/register');
authRouter.use('/verification');

export default authRouter;
