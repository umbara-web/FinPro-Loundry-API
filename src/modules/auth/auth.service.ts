import { AuthRepository } from './auth.repository';
import { RegisterInput, VerifyInput, LoginInput } from './auth.schemas';
import { BadRequestError } from '../../core/exceptions/BadRequestError';
import { NotFoundError } from '../../core/exceptions/NotFoundError';
import { NEXT_PUBLIC_WEB_URL } from '../../configs/env.config';
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} from '../../common/utils/token.helper';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from '../../common/utils/email.helper';

export class AuthService {
  private authRepository = new AuthRepository();

  async registerUser(data: RegisterInput) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);

    if (existingUser) {
      if (existingUser.password) {
        throw new BadRequestError('Email already registered');
      }
      await this.generateAndSendVerification(existingUser);
      return { message: 'Verification email sent (resend)' };
    }

    const user = await this.authRepository.createUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: '',
      // lat: '', long: '' are removed assuming schema mapping adjusts or address is created via Address mode
    });

    await this.generateAndSendVerification(user);
    return { message: 'Verification email sent' };
  }

  async verifyUser(data: VerifyInput) {
    const tokenRecord = await this.authRepository.findToken(data.token);

    if (!tokenRecord) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    const decoded = verifyToken(data.token) as { userId: string };
    const hashedPassword = await hashPassword(data.password);

    await this.authRepository.updateUser(decoded.userId, {
      password: hashedPassword,
      isVerified: true,
    });

    await this.authRepository.deleteToken(data.token);
    return { message: 'Email verified successfully' };
  }

  async loginUser(data: LoginInput) {
    const user = await this.authRepository.findUserByEmail(data.email);

    if (!user) throw new BadRequestError('Invalid email or password');

    if (!user.password) {
      throw new BadRequestError(
        'Please verify your email address before logging in'
      );
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid)
      throw new BadRequestError('Invalid email or password');

    return this.buildLoginResponse(user);
  }

  async socialLogin(data: { email: string; name: string }) {
    let user = await this.authRepository.findUserByEmail(data.email);

    if (!user) {
      user = await this.authRepository.createUser({
        name: data.name,
        email: data.email,
        password: '',
        role: 'CUSTOMER',
        isVerified: true,
      });
    }

    return this.buildLoginResponse(user);
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    if (!user) throw new NotFoundError('User not found');

    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      outlet_id: user.outlet?.id || null, // Adapted to new schema
    };
  }

  // ---- Password / Verifications Helpers ----
  async generateAndSendVerification(user: {
    id: string;
    email: string;
    name: string;
  }) {
    const token = generateToken({ userId: user.id, email: user.email }, '1h');
    await this.authRepository.createToken(token);
    const verificationLink = `${NEXT_PUBLIC_WEB_URL}/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, user.name, verificationLink);
  }

  async requestResetPassword(data: { email: string }) {
    const user = await this.authRepository.findUserByEmail(data.email);
    if (!user) throw new NotFoundError('User not found');

    if (!user.password) {
      throw new BadRequestError(
        'Cannot reset password for social login accounts'
      );
    }

    const token = generateToken({ userId: user.id }, '1h');
    await this.authRepository.createToken(token);

    const resetLink = `${NEXT_PUBLIC_WEB_URL}/auth/reset-password/confirm/${token}`;
    await sendResetPasswordEmail(user.email, user.name, resetLink);

    return { message: 'Reset password email sent' };
  }

  async resetPassword(data: { token: string; password: string }) {
    const tokenRecord = await this.authRepository.findToken(data.token);

    if (!tokenRecord)
      throw new BadRequestError('Invalid or expired reset token');

    const decoded = verifyToken(data.token) as { userId: string };
    const hashedPassword = await hashPassword(data.password);

    await this.authRepository.updateUser(decoded.userId, {
      password: hashedPassword,
    });
    await this.authRepository.deleteToken(data.token);

    return { message: 'Password reset successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.authRepository.findUserByEmail(email);
    if (!user) throw new NotFoundError('Email tidak ditemukan');

    if (user.isVerified) {
      throw new BadRequestError('Akun sudah terverifikasi. Silakan login.');
    }

    const token = generateToken({ userId: user.id, email: user.email }, '1h');
    await this.authRepository.createToken(token);

    const verificationLink = `${NEXT_PUBLIC_WEB_URL}/auth/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, user.name, verificationLink);

    return { message: 'Email verifikasi telah dikirim ulang' };
  }

  // ---- Private Helpers ----
  private buildLoginResponse(user: any) {
    const token = generateToken(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      '1d'
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile_picture_url: user.profileImage, // Using proper schema field mapping
      },
      token,
    };
  }
}
