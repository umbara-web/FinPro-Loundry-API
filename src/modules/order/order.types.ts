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
