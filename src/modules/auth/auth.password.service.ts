import prisma from '../../configs/db';
import { createCustomError } from '../../common/utils/customError';
import { BASE_WEB_URL } from '../../configs/env.config';
import {
  sendVerificationEmail,
  sendResetPasswordEmail,
} from '../../common/utils/email.helper';
import {
  generateToken,
  verifyToken,
  hashPassword,
} from '../../common/utils/token.helper';

export async function generateAndSendVerification(user: {
  id: string;
  email: string;
  name: string;
}) {
  const token = generateToken({ userId: user.id, email: user.email }, '1h');
  await prisma.registerToken.create({ data: { token } });
  const verificationLink = `${BASE_WEB_URL}/auth/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, verificationLink);
}

export async function requestResetPassword(data: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw createCustomError(404, 'User not found');

  if (!user.password) {
    throw createCustomError(
      400,
      'Cannot reset password for social login accounts'
    );
  }

  const token = generateToken({ userId: user.id }, '1h');
  await prisma.registerToken.create({ data: { token } });

  const resetLink = `${BASE_WEB_URL}/reset-password/confirm/${token}`;
  await sendResetPasswordEmail(user.email, user.name, resetLink);

  return { message: 'Reset password email sent' };
}

export async function resetPassword(data: { token: string; password: string }) {
  const tokenRecord = await prisma.registerToken.findUnique({
    where: { token: data.token },
  });

  if (!tokenRecord)
    throw createCustomError(400, 'Invalid or expired reset token');

  const decoded = verifyToken(data.token);
  const hashedPassword = await hashPassword(data.password);

  await prisma.user.update({
    where: { id: decoded.userId },
    data: { password: hashedPassword },
  });

  await prisma.registerToken.delete({ where: { token: data.token } });

  return { message: 'Password reset successfully' };
}

export async function resendVerification(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw createCustomError(404, 'Email tidak ditemukan');

  if (user.isVerified) {
    throw createCustomError(400, 'Akun sudah terverifikasi. Silakan login.');
  }

  const token = generateToken({ userId: user.id, email: user.email }, '1h');
  await prisma.registerToken.create({ data: { token } });

  const verificationLink = `${BASE_WEB_URL}/auth/verify-email?token=${token}`;
  await sendVerificationEmail(user.email, user.name, verificationLink);

  return { message: 'Email verifikasi telah dikirim ulang' };
}
