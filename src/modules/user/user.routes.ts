import { Router } from 'express';
import { UserController } from './user.controller';
import { authMiddleware } from '../../common/middlewares/auth.middleware';
import { uploader } from '../../common/middlewares/uploader';

const userRouter = Router();
const userController = new UserController();

userRouter.patch(
  '/avatar',
  authMiddleware,
  uploader.single('avatar'),
  userController.updateAvatar
);

userRouter.patch('/profile', authMiddleware, userController.updateProfile);
userRouter.patch('/password', authMiddleware, userController.changePassword);

export default userRouter;
