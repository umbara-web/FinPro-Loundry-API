import { Request, Response } from 'express';
import * as addressService from '../services/address.service';

export const getAddresses = async (req: Request, res: Response) => {
    try {

        const userId = req.query.userId as string;
        const addresses = await addressService.getAddresses(userId);
        res.json(addresses);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAddressById = async (req: Request, res: Response) => {
    try {
        const address = await addressService.getAddressById(req.params.id);
        if (!address) {
            return res.status(404).json({ error: 'Address not found' });
        }
        res.json(address);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const createAddress = async (req: Request, res: Response) => {
    try {
        const address = await addressService.createAddress(req.body);
        res.status(201).json(address);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const address = await addressService.updateAddress(req.params.id, req.body);
        res.json(address);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        await addressService.deleteAddress(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
