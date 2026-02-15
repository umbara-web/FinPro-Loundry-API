import { Request, Response, NextFunction } from 'express';
import {
  getAttendanceReportService,
  getBypassRequestsService,
  handleBypassRequestService,
  getDashboardStatsService,
} from '../services/outlet-admin.service';
import prisma from '../configs/db';

export const getAttendanceReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch the admin's outlet from the Staff table
    const staffRecord = await prisma.staff.findFirst({
      where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
    });

    if (!staffRecord) {
      return res
        .status(403)
        .json({ message: 'You are not assigned to any outlet' });
    }

    const { startDate, endDate, staffType } = req.query;

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // Set end of day for the end date to include records from that day
    end.setHours(23, 59, 59, 999);

    const report = await getAttendanceReportService({
      outletId: staffRecord.outlet_id,
      startDate: start,
      endDate: end,
      staffType: staffType as string,
    });

    res.status(200).send({
      message: 'Attendance report fetched successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

export const getBypassRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const staffRecord = await prisma.staff.findFirst({
      where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
    });

    if (!staffRecord) {
      return res
        .status(403)
        .json({ message: 'You are not assigned to any outlet' });
    }

    const requests = await getBypassRequestsService(staffRecord.outlet_id);
    res.status(200).json({ data: requests });
  } catch (error) {
    next(error);
  }
};

export const handleBypassRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { requestId } = req.params;
    const { action } = req.body; // 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const result = await handleBypassRequestService(requestId, action, userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req.user as any)?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const staffRecord = await prisma.staff.findFirst({
      where: { staff_id: userId, staff_type: 'OUTLET_ADMIN' },
    });

    if (!staffRecord) {
      return res
        .status(403)
        .json({ message: 'You are not assigned to any outlet' });
    }

    const stats = await getDashboardStatsService(staffRecord.outlet_id);
    res.status(200).json({
      message: 'Dashboard stats fetched successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
