import { useColorScheme } from 'react-native';
import { createTheme } from '@/theme';
import { useSettingsStore } from '@/store/useSettingsStore';

export const useTheme = () => {
  const scheme = useColorScheme();
  const prefersDark = useSettingsStore((state) => state.prefersDark);
  const isDark = prefersDark ?? scheme === 'dark';
  return createTheme(isDark);
};

