export const palette = {
  primary: '#6C63FF',
  primaryDark: '#524AD9',
  primaryLight: '#A5A0FF',
  secondary: '#FF9F43',
  secondarySoft: '#FFE6CC',
  success: '#1DD1A1',
  danger: '#FF6B6B',
  warning: '#FFC312',
  info: '#48DBFB',
  white: '#FFFFFF',
  black: '#000000',
  slate900: '#1E293B',
  slate800: '#334155',
  slate700: '#475569',
  slate600: '#64748B',
  slate500: '#94A3B8',
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
