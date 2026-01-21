import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  verifyUser,
  loginUser,
  socialLogin,
  requestResetPassword as requestResetPasswordService,
  resetPassword as resetPasswordService,
  getMe as getMeService,
  resendVerification as resendVerificationService,
} from './auth.service';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: 'OK',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function verify(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await verifyUser(req.body);

    res.status(200).json({
      message: 'OK',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);

    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user;
    if (!user) throw new Error('Unauthorized');

    const result = await getMeService(user.userId);

    res.status(200).json({
      message: 'OK',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie('auth_token');
    res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
}

export async function socialLoginController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await socialLogin(req.body);

    res.cookie('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      message: 'Social login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function requestResetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await requestResetPasswordService(req.body);

    res.status(200).json({
      message: 'Reset password email sent',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await resetPasswordService(req.body);

    res.status(200).json({
      message: 'Password reset successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email } = req.body;
    const result = await resendVerificationService(email);

    res.status(200).json({
      message: 'Verification email resent',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
