const FALLBACK_URL = 'http://192.168.1.65:8080';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '') || FALLBACK_URL;

export const SOCKET_URL =
  process.env.EXPO_PUBLIC_WS_URL?.replace(/\/$/, '') ||
  API_BASE_URL.replace('http', 'ws');

