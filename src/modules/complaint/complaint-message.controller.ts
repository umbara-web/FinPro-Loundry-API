import { Request, Response, NextFunction } from 'express';
import { ComplaintMessageService } from './complaint-message.service';
import { ComplaintService } from './complaint.service';

export class ComplaintMessageController {
  /**
   * Send a message
   */
  static async createMessage(
    req: Request<{ complaintId: string }, {}, { message: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = req.user;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { complaintId } = req.params;
      const { message } = req.body;

      // Verify access rights
      if (!['OUTLET_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        await ComplaintService.getComplaintById(complaintId, user.userId).catch(
          () => {
            throw new Error('Complaint not found or access denied');
          }
        );
      }

      const newMessage = await ComplaintMessageService.createMessage({
        complaintId,
        senderId: user.userId,
        message,
      });

      res.status(201).json({
        message: 'Message sent successfully',
        data: newMessage,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get messages
   */
  static async getMessages(
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

      // Verify access logic similar to above
      if (!['OUTLET_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
        await ComplaintService.getComplaintById(complaintId, user.userId).catch(
          () => {
            throw new Error('Complaint not found or access denied');
          }
        );
      }

      const messages = await ComplaintMessageService.getMessages(complaintId);

      res.status(200).json({
        message: 'Messages retrieved successfully',
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  }
}
