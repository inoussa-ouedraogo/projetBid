import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  tone?: 'info' | 'success' | 'warning';
};

export const Tag = ({ label, tone = 'info' }: Props) => {
  const { palette } = useTheme();
  const tones = {
    info: palette.info,
    success: palette.success,
    warning: palette.warning,
  };

  const color = tones[tone];
  return (
    <View style={[styles.container, { backgroundColor: `${color}22` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

