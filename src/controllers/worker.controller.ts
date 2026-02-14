import { Request, Response, NextFunction } from 'express';
import {
  getStationTasksService,
  processTaskService,
  requestBypassService,
  getWorkerHistoryService,
  claimTaskService,
  getTaskDetailService,
} from '../services/worker.service';

export const getStationTasks = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const worker_id = req.user?.userId;
    if (!worker_id) throw new Error('Unauthorized');

    const stationType = (req.query.station as string) || 'WASHING';
    const tasks = await getStationTasksService(worker_id, stationType);
    res.status(200).send({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const claimTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const workerId = req.user?.userId;
    if (!workerId) throw new Error('Unauthorized');

    const result = await claimTaskService(taskId, workerId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const processTask = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const { items } = req.body;
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const result = await processTaskService(taskId, items, userId);

    if (result.code === 'MISMATCH') {
      res.status(400).send(result);
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    next(error);
  }
};

export const requestBypass = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const { reason, items } = req.body;
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const result = await requestBypassService(taskId, reason, userId, items);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getWorkerHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workerId = req.user?.userId;
    if (!workerId) throw new Error('Unauthorized');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const taskType = req.query.taskType as string;

    const result = await getWorkerHistoryService(
      workerId,
      page,
      limit,
      startDate,
      endDate,
      taskType,
    );
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

export const getTaskDetail = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { taskId } = req.params;
    const workerId = req.user?.userId;

    if (!workerId) throw new Error('Unauthorized');

    const result = await getTaskDetailService(taskId, workerId);
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};
