import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { sendResponse } from '../../core/utils/response.util';
import { BadRequestError } from '../../core/exceptions/BadRequestError';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.registerUser(req.body);
      return sendResponse(res, 201, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.verifyUser(req.body);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.loginUser(req.body);

      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return sendResponse(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as any;
      if (!user) throw new BadRequestError('Unauthorized');

      const result = await authService.getMe(user.userId);
      return sendResponse(res, 200, 'OK', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('auth_token');
      return sendResponse(res, 200, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async socialLoginController(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.socialLogin(req.body);

      res.cookie('auth_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      });

      return sendResponse(res, 200, 'Social login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async requestResetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.requestResetPassword(req.body);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.resetPassword(req.body);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email } = req.body;
      const result = await authService.resendVerification(email);
      return sendResponse(res, 200, result.message, result);
    } catch (error) {
      next(error);
    }
  }
}
