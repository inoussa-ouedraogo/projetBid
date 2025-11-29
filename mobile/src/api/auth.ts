import { api } from './client';
import { LoginResponse, MeResponse, RegisterResponse } from './types';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
  consentRgpd: boolean;
};

type UpdateProfilePayload = {
  name?: string;
  phone?: string;
  password?: string;
  city?: string;
};

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>('/api/auth/login', payload).then((r) => r.data);

export const register = (payload: RegisterPayload) =>
  api.post<RegisterResponse>('/api/auth/register', payload).then((r) => r.data);

export const me = () => api.get<MeResponse>('/api/auth/me').then((r) => r.data);

export const updateProfile = (payload: UpdateProfilePayload) =>
  api.put<MeResponse>('/api/auth/update', payload).then((r) => r.data);

export const deleteAccount = () =>
  api.delete<void>('/api/auth/me').then((r) => r.data);
