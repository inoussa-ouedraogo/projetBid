import { ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export const LoadingIndicator = () => {
  const { palette } = useTheme();
  return (
    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
      <ActivityIndicator size="large" color={palette.primary} />
    </View>
  );
};

