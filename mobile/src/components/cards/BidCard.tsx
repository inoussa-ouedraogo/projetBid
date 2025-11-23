import { StyleSheet, Text, View } from 'react-native';
import { Bid } from '@/api/types';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatDate } from '@/utils/format';

type Props = {
  bid: Bid;
};

export const BidCard = ({ bid }: Props) => {
  const { colors, palette } = useTheme();
  return (
    <View style={[styles.card, { borderColor: palette.primary + '22' }]}>
      <View style={styles.row}>
        <Text style={[styles.amount, { color: colors.textPrimary }]}>
          {formatCurrency(bid.amount)}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{bid.userEmail}</Text>
      </View>
      <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
        {formatDate(bid.createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amount: {
    fontWeight: '700',
    fontSize: 18,
  },
  email: {
    fontSize: 13,
  },
  timestamp: {
    fontSize: 12,
  },
});

