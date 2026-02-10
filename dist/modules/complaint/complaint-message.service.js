"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintMessageService = void 0;
const db_1 = __importDefault(require("../../configs/db"));
class ComplaintMessageService {
    // Create a new message for a complaint
    static async createMessage(params) {
        const { complaintId, senderId, message } = params;
        // Verify complaint exists
        const complaint = await db_1.default.complaint.findUnique({
            where: { id: complaintId },
            include: { customer: true },
        });
        if (!complaint) {
            throw new Error('Complaint not found');
        }
        const newMessage = await db_1.default.complaintMessage.create({
            data: {
                complaint_id: complaintId,
                sender_id: senderId,
                message,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        profile_picture_url: true,
                    },
                },
            },
        });
        return newMessage;
    }
    // Get all messages for a complain
    static async getMessages(complaintId) {
        const messages = await db_1.default.complaintMessage.findMany({
            where: { complaint_id: complaintId },
            orderBy: { created_at: 'asc' },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                        profile_picture_url: true,
                    },
                },
            },
        });
        return messages;
    }
}
exports.ComplaintMessageService = ComplaintMessageService;
