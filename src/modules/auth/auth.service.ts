import prisma from '../../configs/db';
import { RegisterInput, VerifyInput, LoginInput } from './auth.schemas';
import { createCustomError } from '../../common/utils/customError';
import {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} from '../../common/utils/token.helper';
import { generateAndSendVerification } from './auth.password.service';

// Re-export from password service for backwards compatibility
export {
  requestResetPassword,
  resetPassword,
  resendVerification,
} from './auth.password.service';

export async function registerUser(data: RegisterInput) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    if (existingUser.password) {
      throw createCustomError(400, 'Email already registered');
    }
    await generateAndSendVerification(existingUser);
    return { message: 'Verification email sent (resend)' };
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: '',
      lat: '',
      long: '',
    },
  });

  await generateAndSendVerification(user);
  return { message: 'Verification email sent' };
}

export async function verifyUser(data: VerifyInput) {
  const tokenRecord = await prisma.registerToken.findUnique({
    where: { token: data.token },
  });

  if (!tokenRecord) {
    throw createCustomError(400, 'Invalid or expired verification token');
  }

  const decoded = verifyToken(data.token);
  const hashedPassword = await hashPassword(data.password);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword, isVerified: true },
  });

  await prisma.registerToken.delete({ where: { token: data.token } });
  return { message: 'Email verified successfully' };
}

export async function loginUser(data: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) throw createCustomError(400, 'Invalid email or password');

  if (!user.password) {
    throw createCustomError(
      400,
      'Please verify your email address before logging in'
    );
  }

  const isPasswordValid = await comparePassword(data.password, user.password);
  if (!isPasswordValid)
    throw createCustomError(400, 'Invalid email or password');

  return buildLoginResponse(user);
}

function buildLoginResponse(user: any) {
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
      profile_picture_url: user.profile_picture_url,
    },
    token,
  };
}

export async function socialLogin(data: { email: string; name: string }) {
  let user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: '',
        role: 'CUSTOMER',
        lat: '',
        long: '',
        isVerified: true,
      },
    });
  }

  return buildLoginResponse(user);
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw createCustomError(404, 'User not found');

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
