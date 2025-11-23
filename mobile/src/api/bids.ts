import { api } from './client';
import { Bid, PagedResponse } from './types';

type PaginationParams = {
  page?: number;
  size?: number;
  sort?: string;
};

export const listMyBids = (params?: PaginationParams) =>
  api
    .get<PagedResponse<Bid>>('/api/me/bids/paged', { params })
    .then((r) => r.data);

