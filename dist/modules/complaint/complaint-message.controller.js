"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintMessageController = void 0;
const complaint_message_service_1 = require("./complaint-message.service");
const complaint_service_1 = require("./complaint.service");
class ComplaintMessageController {
    /**
     * Send a message
     */
    static async createMessage(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { complaintId } = req.params;
            const { message } = req.body;
            // Verify access rights
            if (!['OUTLET_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
                await complaint_service_1.ComplaintService.getComplaintById(complaintId, user.userId).catch(() => {
                    throw new Error('Complaint not found or access denied');
                });
            }
            const newMessage = await complaint_message_service_1.ComplaintMessageService.createMessage({
                complaintId,
                senderId: user.userId,
                message,
            });
            res.status(201).json({
                message: 'Message sent successfully',
                data: newMessage,
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get messages
     */
    static async getMessages(req, res, next) {
        try {
            const user = req.user;
            if (!user) {
                throw new Error('User not authenticated');
            }
            const { complaintId } = req.params;
            // Verify access logic similar to above
            if (!['OUTLET_ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
                await complaint_service_1.ComplaintService.getComplaintById(complaintId, user.userId).catch(() => {
                    throw new Error('Complaint not found or access denied');
                });
            }
            const messages = await complaint_message_service_1.ComplaintMessageService.getMessages(complaintId);
            res.status(200).json({
                message: 'Messages retrieved successfully',
                data: messages,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ComplaintMessageController = ComplaintMessageController;
