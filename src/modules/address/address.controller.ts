import { Request, Response, NextFunction } from 'express';
import * as addressService from './address.service';
import { CreateAddressInput, UpdateAddressInput } from './address.schemas';

export const getAddresses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const addresses = await addressService.getUserAddresses(userId);
    res.status(200).json(addresses);
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const data: CreateAddressInput = req.body;
    const address = await addressService.createAddress(userId, data);

    res.status(201).json({
      message: 'Alamat berhasil ditambahkan',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const addressId = req.params.id;
    const data: UpdateAddressInput = req.body;

    const address = await addressService.updateAddress(userId, addressId, data);

    res.status(200).json({
      message: 'Alamat berhasil diperbarui',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const addressId = req.params.id;
    await addressService.deleteAddress(userId, addressId);

    res.status(200).json({
      message: 'Alamat berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

export const setPrimaryAddress = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const addressId = req.params.id;
    const address = await addressService.setPrimaryAddress(userId, addressId);

    res.status(200).json({
      message: 'Alamat utama berhasil diubah',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};
