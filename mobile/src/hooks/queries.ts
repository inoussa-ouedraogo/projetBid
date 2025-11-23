import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listAuctions,
  listPagedAuctions,
  getAuction,
  listBidsForAuction,
  placeBid,
  listParticipatedAuctions,
  getMyRank,
} from '@/api/auctions';
import { listMyBids } from '@/api/bids';
import { listProducts } from '@/api/products';
import { AuctionStatus, BidPayload } from '@/api/types';

type AuctionFilters = {
  status?: AuctionStatus;
  category?: string;
  search?: string;
};

export const useAuctions = (filters?: AuctionFilters) =>
  useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => listAuctions(filters),
  });

export const usePagedAuctions = (filters?: {
  page?: number;
  status?: AuctionStatus;
  category?: string;
  search?: string;
}) =>
  useQuery({
    queryKey: ['auctions-paged', filters],
    queryFn: () => listPagedAuctions({ size: 10, ...filters }),
  });

export const useAuctionDetail = (id?: number) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['auction', id],
    queryFn: () => getAuction(id!),
  });

export const useAuctionBids = (id?: number) =>
  useQuery({
    enabled: Boolean(id),
    queryKey: ['auction-bids', id],
    queryFn: () => listBidsForAuction(id!),
    staleTime: 60000,
  });

export const useMyBids = (page = 0) =>
  useQuery({
    queryKey: ['my-bids', page],
    queryFn: () => listMyBids({ page }),
  });

export const useProducts = (query?: string) =>
  useQuery({
    queryKey: ['products', query],
    queryFn: () => listProducts(query),
  });

export const useParticipatedAuctions = () =>
  useQuery({
    queryKey: ['participated-auctions'],
    queryFn: () => listParticipatedAuctions(),
  });

export const useMyRank = (auctionId?: number) =>
  useQuery({
    enabled: Boolean(auctionId),
    queryKey: ['auction-rank', auctionId],
    queryFn: () => getMyRank(auctionId!),
    staleTime: 15000,
  });

export const useBidMutation = (auctionId: number) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: BidPayload) => placeBid(auctionId, payload),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['auction-bids', auctionId] });
      client.invalidateQueries({ queryKey: ['auction', auctionId] });
      client.invalidateQueries({ queryKey: ['my-bids'] });
      client.invalidateQueries({ queryKey: ['auction-rank', auctionId] });
      client.invalidateQueries({ queryKey: ['participated-auctions'] });
    },
  });
};
