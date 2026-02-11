import { Request, Response } from 'express';
import * as workerService from '../services/worker.service';

export const getWorkers = async (req: Request, res: Response) => {
    try {
        const workers = await workerService.getWorkers();
        res.json(workers);
    } catch (error) {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create worker' });
    }
};

export const updateWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const worker = await workerService.updateWorker(id, req.body);
        res.json(worker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update worker' });
    }
};

export const deleteWorker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await workerService.deleteWorker(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete worker' });
    }
};
