export const palette = {
  primary: '#2563EB', // Kibsi blue
  primaryDark: '#1D4ED8',
  primaryLight: '#93C5FD',
  secondary: '#0EA5E9',
  secondarySoft: '#E0F2FE',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
  white: '#FFFFFF',
  black: '#000000',
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#CBD5E1',
  slate300: '#E2E8F0',
  slate200: '#F1F5F9',
  slate100: '#F8FAFC',
  slate50: '#F9FAFB',
};

export const lightColors = {
  background: palette.slate50,
  surface: palette.white,
  elevated: '#FFFFFFD9',
  textPrimary: palette.slate900,
  textSecondary: palette.slate600,
  border: palette.slate200,
  muted: palette.slate500,
  shadow: '#1E293B1A',
};

export const darkColors = {
  background: '#121212',
  surface: '#1E1E1E',
  elevated: '#2C2C2C',
  textPrimary: palette.white,
  textSecondary: palette.slate400,
  border: '#2C2C2C',
  muted: palette.slate600,
  shadow: '#00000055',
};

export const gradients = {
  hero: [palette.primary, palette.primaryLight],
  secondary: [palette.slate800, palette.slate900],
};

export type ThemeColors = typeof lightColors;
