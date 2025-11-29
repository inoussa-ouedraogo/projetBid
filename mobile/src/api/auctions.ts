import { api } from './client';
import { Auction, AuctionStatus, Bid, PagedResponse, BidPayload, RankResponse, BuyNowPayload } from './types';

type AuctionFilters = {
  status?: AuctionStatus;
  category?: string;
  productId?: number;
  search?: string;
  city?: string;
};

type PagedFilters = AuctionFilters & {
  page?: number;
  size?: number;
  sort?: string;
};

export const listAuctions = (filters?: AuctionFilters) => {
  const { search, ...rest } = filters || {};
  return api
    .get<Auction[]>('/api/auctions', {
      params: { ...rest, q: search },
    })
    .then((r) => r.data);
};

export const listPagedAuctions = (filters?: PagedFilters) =>
  api
    .get<PagedResponse<Auction>>('/api/auctions/paged', {
      params: (() => {
        const { search, ...rest } = filters || {};
        return { ...rest, q: search };
      })(),
    })
    .then((r) => r.data);

export const getAuction = (id: number) =>
  api.get<Auction>(`/api/auctions/${id}`).then((r) => r.data);

export const listBidsForAuction = (id: number) =>
  api.get<Bid[]>(`/api/auctions/${id}/bids`).then((r) => r.data);

export const placeBid = (auctionId: number, payload: BidPayload) =>
  api
    .post<Bid>(`/api/auctions/${auctionId}/bids`, payload)
    .then((r) => r.data);

export const closeAuctionNow = (auctionId: number) =>
  api.post<Auction>(`/api/auctions/${auctionId}/close`, {}).then((r) => r.data);

export const listParticipatedAuctions = () =>
  api.get<Auction[]>('/api/auctions/participated').then((r) => r.data);

export const getMyRank = (auctionId: number) =>
  api.get<RankResponse>(`/api/auctions/${auctionId}/my-rank`).then((r) => r.data);

export const buyNow = (auctionId: number, payload: BuyNowPayload) =>
  api.post<Auction>(`/api/auctions/${auctionId}/buy-now`, payload).then((r) => r.data);
