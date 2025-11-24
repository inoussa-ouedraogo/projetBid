import { api } from './client';
import { Purchase } from './types';

export const listMyPurchases = () =>
  api.get<Purchase[]>('/api/purchases/mine').then((r) => r.data);
