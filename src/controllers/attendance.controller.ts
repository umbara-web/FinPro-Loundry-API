import { Request, Response, NextFunction } from 'express';
import {
  clockInService,
  clockOutService,
  getHistoryService,
  getStatusService,
} from '../services/attendance.service';

export const clockIn = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const result = await clockInService(userId);
    res.status(201).send(result);
  } catch (error: any) {
    if (
      error.message === 'Staff profile not found' ||
      error.message === 'No shift assigned to this staff'
    ) {
      res.status(404).send({ message: error.message });
    } else if (error.message === 'Already clocked in today') {
      res.status(400).send({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const clockOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const result = await clockOutService(userId);
    res.status(200).send(result);
  } catch (error: any) {
    if (error.message === 'No active check-in found for today') {
      res.status(400).send({ message: error.message });
    } else {
      next(error);
    }
  }
};

export const getHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const history = await getHistoryService(userId);
    res.status(200).send({ data: history });
  } catch (error) {
    next(error);
  }
};

export const getStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new Error('Unauthorized');

    const status = await getStatusService(userId);
    res.status(200).send({ data: status });
  } catch (error) {
    next(error);
  }
};
