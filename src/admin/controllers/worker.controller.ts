import { Request, Response } from 'express';
import * as workerService from '../services/worker.service';

export const getWorkers = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 5;
        const search = req.query.search as string || '';
        const role = req.query.role as string || '';
        const status = req.query.status as string || '';

        const user = (req as any).user;
        let outletId: string | undefined;

        if (user.role === 'OUTLET_ADMIN') {
            outletId = user.outlet_id;
        }

        const result = await workerService.getWorkers({ page, limit, search, role, status, outletId });

        res.json(result);
    } catch (error) {
        console.error('Error fetching workers:', error);
        res.status(500).json({ error: 'Failed to fetch workers' });
    }
};

export const getWorkerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const worker = await workerService.getWorkerById(id);
        if (!worker) {
            return res.status(404).json({ error: 'Worker not found' });
        }
        res.json(worker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch worker' });
    }
};

export const createWorker = async (req: Request, res: Response) => {
    try {
        const worker = await workerService.createWorker(req.body);
        res.status(201).json(worker);
    } catch (error: any) {
        console.error('Error creating worker:', error);

        if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
            return res.status(409).json({
                error: 'Gagal menambahkan worker',
                details: 'Email sudah terdaftar. Gunakan email lain.'
            });
        }

        res.status(500).json({
            error: 'Failed to create worker',
            details: error.message || 'Unknown error'
        });
    }
};

export const updateWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const worker = await workerService.updateWorker(id, req.body);
        res.json(worker);
    } catch (error: any) {
        console.error('Error updating worker:', error);
        res.status(500).json({
            error: 'Failed to update worker',
            details: error.message || 'Unknown error'
        });
    }
};

export const deleteWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await workerService.deleteWorker(id);
        res.status(204).send();
    } catch (error: any) {
        console.error('Error deleting worker:', error);
        res.status(500).json({
            error: 'Failed to delete worker',
            details: error.message || 'Unknown error'
        });
    }
};
