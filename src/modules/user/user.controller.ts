import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { cloudinaryUpload } from '../../configs/cloudinary';
import { sendResponse } from '../../core/utils/response.util';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

const userService = new UserService();

export class UserController {
  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new BadRequestError('No file uploaded');
      }

      const userId = (req as any).user.userId;

      const { secure_url } = await cloudinaryUpload(req.file, 'profiles');
      const updatedUser = await userService.updateAvatar(userId, secure_url);

      return sendResponse(res, 200, 'Avatar updated successfully', updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { name, phone, email, birthDate } = req.body;

      const updatedUser = await userService.updateProfile(userId, {
        name,
        phone,
        email,
        birthDate: birthDate ? new Date(birthDate) : undefined,
      });

      return sendResponse(
        res,
        200,
        'Profile updated successfully',
        updatedUser
      );
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const { oldPassword, newPassword, confirmNewPassword } = req.body;

      if (newPassword !== confirmNewPassword) {
        throw new BadRequestError('Konfirmasi password baru tidak cocok');
      }

      if (newPassword.length < 6) {
        throw new BadRequestError('Password baru minimal 6 karakter');
      }

      const response = await userService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      return sendResponse(res, 200, response.message);
    } catch (error) {
      next(error);
    }
  }
}
