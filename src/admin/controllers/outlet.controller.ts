import { Request, Response } from 'express';
import * as outletService from '../services/outlet.service';

export const getOutlets = async (req: Request, res: Response) => {
    try {
        const outlets = await outletService.getOutlets();
        res.json(outlets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch outlets' });
    }
};

export const getOutletById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const outlet = await outletService.getOutletById(id);
        if (!outlet) {
            return res.status(404).json({ error: 'Outlet not found' });
        }
        res.json(outlet);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch outlet' });
    }
};

export const createOutlet = async (req: Request, res: Response) => {
    try {
        const outlet = await outletService.createOutlet(req.body);
        res.status(201).json(outlet);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create outlet' });
    }
};

export const updateOutlet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const outlet = await outletService.updateOutlet(id, req.body);
        res.json(outlet);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update outlet' });
    }
};

export const deleteOutlet = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await outletService.deleteOutlet(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete outlet' });
    }
};
