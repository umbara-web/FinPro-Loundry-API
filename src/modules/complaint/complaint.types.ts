import { Complaint_Status, Complaint_Type } from '@prisma/client';

export interface CreateComplaintParams {
  orderId: string;
  customerId: string;
  type: Complaint_Type;
  description: string;
  images?: string[];
}

export interface GetComplaintsParams {
  customerId: string;
  page: number;
  limit: number;
  status?: Complaint_Status;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}
