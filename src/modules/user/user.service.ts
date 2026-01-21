import prisma from '../../configs/db';
import { hashPassword, comparePassword } from '../../common/utils/token.helper';
import { createCustomError } from '../../common/utils/customError';

export class UserService {
  async updateAvatar(userId: string, avatarUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        profile_picture_url: avatarUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        profile_picture_url: true,
        phone: true,
      },
    });
  }
  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; email?: string; birthDate?: Date }
  ) {
    // Check if email is being updated
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        throw new Error('Email already in use');
      }
    }

    // If email changes, set isVerified to false
    // We need to fetch current user to compare? Or just update if data.email is present?
    // Let's assume controller filters `data`.

    const updateData: any = { ...data };

    // We will handle email verification logic in controller or separate service method if needed.
    // For now simple update.

    // Actually, requirement says "wajib verifikasi ulang".
    // So if email changes, we set isVerified = false.

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });

    if (data.email && data.email !== currentUser?.email) {
      updateData.isVerified = false;
      // Trigger verification email sending in controller
    }

    return await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        profile_picture_url: true,
        phone: true,
      },
    });
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw createCustomError(400, 'User not found or no password set');
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      throw createCustomError(400, 'Password lama salah');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
