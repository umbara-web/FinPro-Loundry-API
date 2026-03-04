import { prisma } from '../../core/prisma/prisma.client';
import { Prisma } from '@prisma/client';

export class UserRepository {
  async update(userId: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id: userId },
      data,
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

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  }

  async updatePassword(id: string, passwordHash: string) {
    return await prisma.user.update({
      where: { id },
      data: { password: passwordHash },
    });
  }
}
