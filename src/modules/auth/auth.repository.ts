import { prisma } from '../../core/prisma/prisma.client';
import { Prisma } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        outlet: {
          select: { id: true, name: true, franchiseId: true },
        },
      },
    });
  }

  async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        outlet: {
          select: { id: true, name: true, franchiseId: true },
        },
      },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
      include: {
        outlet: {
          select: { id: true, name: true, franchiseId: true },
        },
      },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  // Tokens handling
  async createToken(token: string) {
    return await prisma.registerToken.create({
      data: { token },
    });
  }

  async findToken(token: string) {
    return await prisma.registerToken.findUnique({
      where: { token },
    });
  }

  async deleteToken(token: string) {
    return await prisma.registerToken.delete({
      where: { token },
    });
  }
}
