import { LinearGradient } from 'expo-linear-gradient';
import { View, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  size?: number;
  subtitle?: string;
};

export const KibsiLogo = ({ size = 72, subtitle }: Props) => {
  const { palette, colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 3,
          overflow: 'hidden',
          transform: [{ rotate: '-6deg' }],
        }}
      >
        <LinearGradient
          colors={[palette.primary, palette.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            style={{
              color: palette.white,
              fontSize: size / 2.2,
              fontWeight: '800',
              letterSpacing: 1,
            }}
          >
            K
          </Text>
        </LinearGradient>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '800', color: colors.textPrimary }}>Kibsi</Text>
      {subtitle ? (
        <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>{subtitle}</Text>
      ) : null}
    </View>
  );
};
