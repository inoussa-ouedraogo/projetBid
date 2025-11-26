export type AuctionStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'RUNNING'
  | 'PAUSED'
  | 'FINISHED'
  | 'CANCELED';

export type AuctionType = 'REVERSE';

export interface Auction {
  id: number;
  productId: number;
  productTitle: string;
  title: string;
  description: string;
  participationFee: number;
  currency: string;
  minBid: number;
  maxBid: number;
  buyNowPrice?: number;
  startAt: string;
  endAt: string;
  participantLimit: number;
  status: AuctionStatus;
  winnerBidId?: number;
  myLastBidAmount?: number;
  myLastBidAt?: string;
  myRank?: number;
  myBidUnique?: boolean;
  totalBids?: number;
  createdAt: string;
  updatedAt: string;
  type: AuctionType;
  category?: string;
  imageUrl?: string;
   imageUrl2?: string;
   imageUrl3?: string;
  isActive?: boolean;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
  imageUrl2?: string;
  imageUrl3?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  userEmail: string;
  amount: number;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  name: string;
  email: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  message: string;
}

export interface MeResponse {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  isVerified: boolean;
  walletBalance: number;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export type BidPayload = {
  amount: number;
};

export interface RankResponse {
  myRank: number;
  myBidUnique: boolean;
  myBidAmount?: number;
  highestBidAmount?: number;
  uniqueCount: number;
  totalBids: number;
}

export type BuyNowPayload = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: 'ORANGE_MONEY' | 'CASH_ON_DELIVERY';
};

export interface Purchase {
  id: number;
  auctionId: number;
  auctionTitle: string;
  productTitle?: string;
  buyerEmail?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  createdAt: string;
}
