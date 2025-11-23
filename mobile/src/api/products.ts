import { api } from './client';
import { Product } from './types';

export const listProducts = (query?: string) =>
  api
    .get<Product[]>('/api/products/public', { params: query ? { q: query } : undefined })
    .then((r) => r.data);
