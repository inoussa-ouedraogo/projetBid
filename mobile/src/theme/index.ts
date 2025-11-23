import { darkColors, lightColors, palette } from './colors';
import { spacing } from './spacing';
import { typography } from './typography';

export const createTheme = (isDark: boolean) => ({
  colors: isDark ? darkColors : lightColors,
  palette,
  spacing,
  typography,
});

export type AppTheme = ReturnType<typeof createTheme>;

