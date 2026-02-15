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
        console.log('Creating outlet with data:', req.body);
        const outlet = await outletService.createOutlet(req.body);
        res.status(201).json(outlet);
    } catch (error: any) {
        console.error('createOutlet error:', error);
        const errorMessage = error.message || 'Unknown error';
        res.status(500).json({ 
            error: 'Failed to create outlet', 
            details: errorMessage,
            // Include Prisma error info if available
            prismaError: error.code ? { code: error.code, meta: error.meta } : undefined
        });
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
        res.status(200).json({ message: 'Outlet deleted successfully' });
    } catch (error) {
        console.error('deleteOutlet error:', error);
        res.status(500).json({ error: 'Failed to delete outlet' });
    }
};
