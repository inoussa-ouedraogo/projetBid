import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  title: string;
  subtitle?: string;
};

export const EmptyState = ({ title, subtitle }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
  },
  subtitle: {
    textAlign: 'center',
  },
});

