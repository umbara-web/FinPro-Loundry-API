import { Request, Response, NextFunction } from 'express';
import { ComplaintService } from './complaint.service';
import { CreateComplaintBody, GetComplaintsQuery } from './complaint.schemas';
import { cloudinaryUpload } from '../../configs/cloudinary';

export class ComplaintController {
  /**
   * Create a new complaint
   */
  static async createComplaint(
    req: Request<{}, {}, CreateComplaintBody>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { orderId, type, description } = req.body;

      const files = req.files as Express.Multer.File[];
      let images: string[] = [];

      if (files && files.length > 0) {
        // Upload images to Cloudinary
        const uploadPromises = files.map((file) =>
          cloudinaryUpload(file, 'complaints')
        );
        const uploadResults = await Promise.all(uploadPromises);
        images = uploadResults.map((result) => result.secure_url);
      }

      const complaint = await ComplaintService.createComplaint({
        orderId,
        customerId: user.userId,
        type: type as any,
        description,
        images,
      });

      res.status(201).json({
        message: 'Complaint submitted successfully',
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all complaints for current user
   */
  static async getComplaints(
    req: Request<{}, {}, {}, GetComplaintsQuery>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { page, limit, status, sortBy, sortOrder, search } = req.query;

      const result = await ComplaintService.getComplaints({
        customerId: user.userId,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status: status as any,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        search: search as string,
      });

      res.status(200).json({
        message: 'Complaints retrieved successfully',
        data: result.data,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single complaint by ID
   */
  static async getComplaintById(
    req: Request<{ complaintId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { complaintId } = req.params;

      const complaint = await ComplaintService.getComplaintById(
        complaintId,
        user.userId
      );

      res.status(200).json({
        message: 'Complaint retrieved successfully',
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get complaint by order ID
   */
  static async getComplaintByOrderId(
    req: Request<{ orderId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { orderId } = req.params;

      const complaint = await ComplaintService.getComplaintByOrderId(
        orderId,
        user.userId
      );

      res.status(200).json({
        message: complaint
          ? 'Complaint found'
          : 'No complaint found for this order',
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update complaint status
   */
  static async updateStatus(
    req: Request<{ complaintId: string }, {}, { status: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // In real app, check if user is admin. For now, we allow it for testing/context.
      // if (user.role !== 'OUTLET_ADMIN' && user.role !== 'SUPER_ADMIN') ...

      const { complaintId } = req.params;
      const { status } = req.body;

      const complaint = await ComplaintService.updateStatus(
        complaintId,
        status as any
      );

      res.status(200).json({
        message: 'Complaint status updated successfully',
        data: complaint,
      });
    } catch (error) {
      next(error);
    }
  }
}
