import prisma from '../../configs/db';

interface CreateMessageParams {
  complaintId: string;
  senderId: string;
  message: string;
}

export class ComplaintMessageService {
  // Create a new message for a complaint
  static async createMessage(params: CreateMessageParams) {
    const { complaintId, senderId, message } = params;

    // Verify complaint exists
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { customer: true },
    });

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    const newMessage = await prisma.complaintMessage.create({
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
  static async getMessages(complaintId: string) {
    const messages = await prisma.complaintMessage.findMany({
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
