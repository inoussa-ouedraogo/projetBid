import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Auction } from '@/api/types';
import { useTheme } from '@/hooks/useTheme';
import { formatCity, formatCurrency, formatRelative } from '@/utils/format';
import { resolveImageUrl } from '@/utils/media';
import { GavelIcon } from '../icons/GavelIcon';
import { WalletIcon } from '../icons/WalletIcon';
import { Ionicons } from '@expo/vector-icons';
import { useFavoritesStore } from '@/store/useFavoritesStore';

type Props = {
  auction: Auction;
  onPress?: (auction: Auction) => void;
  onShare?: (auction: Auction) => void;
};

export const AuctionCard = ({ auction, onPress, onShare }: Props) => {
  const { colors, palette } = useTheme();
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(auction.id));

  const statusColor =
    auction.status === 'RUNNING'
      ? palette.success
      : auction.status === 'SCHEDULED'
      ? palette.info
      : palette.slate400;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface, shadowColor: colors.shadow, borderColor: colors.border },
      ]}
      onPress={() => onPress?.(auction)}
      activeOpacity={0.8}
    >
      <View style={styles.imageWrapper}>
        <View
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => toggleFavorite(auction.id)}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.surface + 'dd',
              borderRadius: 18,
              padding: 8,
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? palette.primary : colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              if (onShare) {
                onShare(auction);
                return;
              }
              try {
                const url = auction.imageUrl ? resolveImageUrl(auction.imageUrl) : undefined;
                await Share.share({
                  message: `SmartBid · ${auction.title} · Mise min ${formatCurrency(
                    auction.minBid,
                    auction.currency
                  )} · Fin ${formatRelative(auction.endAt)}`,
                  url,
                });
              } catch {
                // no-op
              }
            }}
            activeOpacity={0.7}
            style={{
              backgroundColor: colors.surface + 'dd',
              borderRadius: 18,
              padding: 8,
            }}
          >
            <Ionicons name="share-social-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {auction.imageUrl ? (
          <Image source={{ uri: resolveImageUrl(auction.imageUrl) }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={gradients.placeholder}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.placeholder}
          >
            <Text style={{ color: palette.primaryLight, fontWeight: '700', fontSize: 18 }}>
              {auction.category || 'SmartBid'}
            </Text>
          </LinearGradient>
        )}
        <View style={[styles.badge, { backgroundColor: statusColor + '33' }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>{auction.status}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {auction.title}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={2}>
          {auction.description}
        </Text>

        {auction.city ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.metaLabel, { color: colors.textSecondary }]} numberOfLines={1}>
              {formatCity(auction.city)}
            </Text>
          </View>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <WalletIcon color={colors.textSecondary} />
            <View>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Participation</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {formatCurrency(auction.participationFee, auction.currency)}
              </Text>
            </View>
          </View>

          <View style={styles.metaItem}>
            <GavelIcon color={colors.textSecondary} />
            <View>
              <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Fin</Text>
              <Text style={[styles.metaValue, { color: colors.textPrimary }]}>
                {formatRelative(auction.endAt)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const gradients = {
  placeholder: ['#6C63FF22', '#A5A0FF44'],
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 20,
    shadowOpacity: 0.08,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
    borderWidth: 1,
  },
  imageWrapper: {
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  content: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});
