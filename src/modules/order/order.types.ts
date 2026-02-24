export interface GetOrdersParams {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProcessOrderItem {
  laundry_item_id: string;
  qty: number;
}

export interface ProcessOrderPayload {
  items: ProcessOrderItem[];
  totalWeight: number;
}
