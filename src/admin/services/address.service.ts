import { prisma } from '../lib/prisma';
import { Address, Prisma } from '@prisma/client';

export const getAddresses = async (userId?: string) => {
  const where: Prisma.AddressWhereInput = userId ? { userId } : {};
  return await prisma.address.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
};

export const getAddressById = async (id: string) => {
  return await prisma.address.findUnique({
    where: { id },
  });
};

export const createAddress = async (data: Prisma.AddressUncheckedCreateInput) => {
  // If this is set to primary, update others to false
  if (data.isPrimary && data.userId) {
    await prisma.address.updateMany({
      where: { userId: data.userId },
      data: { isPrimary: false },
    });
  }

  return await prisma.address.create({
    data,
  });
};

export const updateAddress = async (id: string, data: Prisma.AddressUncheckedUpdateInput) => {
  if (data.isPrimary === true && typeof data.userId === 'string') {
    await prisma.address.updateMany({
      where: { userId: data.userId, id: { not: id } },
      data: { isPrimary: false },
    });
  }

  return await prisma.address.update({
    where: { id },
    data,
  });
};

export const deleteAddress = async (id: string) => {
  return await prisma.address.delete({
    where: { id },
  });
};
