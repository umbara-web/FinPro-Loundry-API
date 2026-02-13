import { prisma } from '../lib/prisma';
import { Customer_Address, Prisma } from '@prisma/client';

export const getAddresses = async (userId?: string) => {
  const where: Prisma.Customer_AddressWhereInput = userId ? { customer_id: userId } : {};
  return await prisma.customer_Address.findMany({
    where,
    orderBy: { created_at: 'desc' },
  });
};

export const getAddressById = async (id: string) => {
  return await prisma.customer_Address.findUnique({
    where: { id },
  });
};

export const createAddress = async (data: Prisma.Customer_AddressUncheckedCreateInput) => {
  // If this is set to primary, update others to false
  if (data.is_primary && data.customer_id) {
    await prisma.customer_Address.updateMany({
      where: { customer_id: data.customer_id },
      data: { is_primary: false },
    });
  }

  return await prisma.customer_Address.create({
    data,
  });
};

export const updateAddress = async (id: string, data: Prisma.Customer_AddressUncheckedUpdateInput) => {
  if (data.is_primary === true && typeof data.customer_id === 'string') {
    await prisma.customer_Address.updateMany({
      where: { customer_id: data.customer_id, id: { not: id } },
      data: { is_primary: false },
    });
  }

  return await prisma.customer_Address.update({
    where: { id },
    data,
  });
};

export const deleteAddress = async (id: string) => {
  return await prisma.customer_Address.delete({
    where: { id },
  });
};
