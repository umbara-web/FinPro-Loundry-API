import prisma from '../../configs/db';
import { Complaint_Status, Prisma } from '@prisma/client';
import { CreateComplaintParams, GetComplaintsParams } from './complaint.types';
import { logger } from '../../lib/logger';

export class ComplaintService {
  /**
   * Create a new complaint for an order
   */
  static async createComplaint(params: CreateComplaintParams) {
    const { orderId, customerId } = params;

    await this.validateOrderForComplaint(orderId, customerId);
    await this.ensureNoActiveComplaint(orderId, customerId);

    return this.persistComplaint(params);
  }

  private static async validateOrderForComplaint(
    orderId: string,
    customerId: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { pickup_request: true },
    });

    if (!order) throw new Error('Order not found');

    if (order.pickup_request.customer_id !== customerId) {
      throw new Error('You can only file complaints for your own orders');
    }

    if (!['DELIVERED', 'COMPLETED'].includes(order.status)) {
      throw new Error(
        'Complaints can only be filed for delivered or completed orders'
      );
    }
  }

  private static async ensureNoActiveComplaint(
    orderId: string,
    customerId: string
  ) {
    const existingComplaint = await prisma.complaint.findFirst({
      where: {
        order_id: orderId,
        customer_id: customerId,
        status: { in: ['OPEN', 'IN_REVIEW'] },
      },
    });

    if (existingComplaint) {
      throw new Error('You already have an active complaint for this order');
    }
  }

  private static async persistComplaint(params: CreateComplaintParams) {
    return prisma.complaint.create({
      data: {
        order_id: params.orderId,
        customer_id: params.customerId,
        type: params.type,
        description: params.description,
        images: params.images || [],
        status: 'OPEN',
      },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total_weight: true,
            price_total: true,
          },
        },
      },
    });
  }

  static async getComplaints(params: GetComplaintsParams) {
    const {
      customerId,
      page,
      limit,
      status,
      sortBy = 'created_at',
      sortOrder = 'desc',
      search,
    } = params;
    const where: Prisma.ComplaintWhereInput = {
      customer_id: customerId,
      ...(status && { status }),
      ...(search && {
        order: {
          id: { contains: search, mode: 'insensitive' },
        },
      }),
    };

    const [total, complaints] = await Promise.all([
      prisma.complaint.count({ where }),
      this.fetchComplaintsList(where, page, limit, sortBy, sortOrder),
    ]);

    return {
      data: complaints,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private static async fetchComplaintsList(
    where: Prisma.ComplaintWhereInput,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ) {
    return prisma.complaint.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total_weight: true,
            price_total: true,
            created_at: true,
          },
        },
      },
    });
  }

  static async getComplaintById(complaintId: string, customerId: string) {
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            total_weight: true,
            price_total: true,
            created_at: true,
            order_item: { include: { laundry_item: true } },
          },
        },
      },
    });

    if (!complaint) throw new Error('Complaint not found');
    if (complaint.customer_id !== customerId)
      throw new Error('You can only view your own complaints');

    return complaint;
  }

  static async getComplaintByOrderId(orderId: string, customerId: string) {
    return prisma.complaint.findFirst({
      where: { order_id: orderId, customer_id: customerId },
      include: { order: { select: { id: true, status: true } } },
    });
  }

  static async updateStatus(complaintId: string, status: Complaint_Status) {
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
      include: { customer: true, order: true },
    });

    this.triggerStatusEmail(complaint, status);
    return complaint;
  }

  private static async triggerStatusEmail(complaint: any, status: string) {
    try {
      const {
        sendComplaintStatusEmail,
      } = require('../../common/utils/email.helper');
      await sendComplaintStatusEmail(
        complaint.customer.email,
        complaint.customer.name,
        complaint.id,
        status,
        complaint.order.id
      );
    } catch (err: any) {
      logger.error('Failed to send email:', err.message || err);
    }
  }
}
