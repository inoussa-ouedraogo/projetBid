import { useMemo, useState } from 'react';
import { Text, View, Dimensions } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { useAuctions } from '@/hooks/queries';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { useTheme } from '@/hooks/useTheme';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { RootStackParamList } from '@/navigation/types';

const { width } = Dimensions.get('window');

const SwipeScreen = () => {
  const { colors, palette } = useTheme();
  const { data: running = [], isLoading } = useAuctions({ status: 'RUNNING' });
  const addFavorite = useFavoritesStore((state) => state.add);
  const [ignoredIds, setIgnoredIds] = useState<number[]>([]);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const items = useMemo(
    () => running.filter((a) => !ignoredIds.includes(a.id)),
    [running, ignoredIds]
  );

  const handleSwipe = (direction: 'left' | 'right', id: number) => {
    if (direction === 'right') {
      addFavorite(id);
    }
    setIgnoredIds((prev) => [...prev, id]);
  };

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          Parcours rapide
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Swipe à droite pour ajouter aux favoris, à gauche pour ignorer.
        </Text>

        {isLoading ? (
          <LoadingIndicator />
        ) : items.length === 0 ? (
          <EmptyState title="Plus rien à parcourir" subtitle="Reviens plus tard pour de nouvelles enchères." />
        ) : (
          items.map((auction) => (
            <Swipeable
              key={auction.id}
              onSwipeableOpen={(dir) => handleSwipe(dir === 'left' ? 'left' : 'right', auction.id)}
              renderLeftActions={() => (
                <View
                  style={{
                    width: width * 0.2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: palette.primary + '22',
                  }}
                >
                  <Text style={{ color: palette.primary, fontWeight: '700' }}>Favori</Text>
                </View>
              )}
              renderRightActions={() => (
                <View
                  style={{
                    width: width * 0.2,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: colors.border,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Ignorer</Text>
                </View>
              )}
            >
              <View style={{ marginBottom: 16 }}>
                <AuctionCard
                  auction={auction}
                  onPress={() => navigation.navigate('AuctionDetail', { id: auction.id })}
                />
              </View>
            </Swipeable>
          ))
        )}
      </View>
    </Screen>
  );
};

export default SwipeScreen;
