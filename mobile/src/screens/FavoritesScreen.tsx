import { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { useAuctions } from '@/hooks/queries';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { useTheme } from '@/hooks/useTheme';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { RootStackParamList } from '@/navigation/types';

const FavoritesScreen = () => {
  const { colors } = useTheme();
  const favorites = useFavoritesStore((state) => state.favorites);
  const { data: allAuctions = [], isLoading } = useAuctions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const favoriteAuctions = useMemo(
    () => allAuctions.filter((a) => favorites.includes(a.id)),
    [allAuctions, favorites]
  );

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          Mes favoris
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Retrouve rapidement les enchères que tu as mises de côté pour enchérir plus tard.
        </Text>

        {isLoading ? (
          <LoadingIndicator />
        ) : favoriteAuctions.length === 0 ? (
          <EmptyState title="Aucun favori" subtitle="Ajoute des enchères depuis la liste ou le détail." />
        ) : (
          <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 8 }}>
            {favoriteAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                auction={auction}
                onPress={() => navigation.navigate('AuctionDetail', { id: auction.id })}
              />
            ))}
          </ScrollView>
        )}
      </View>
    </Screen>
  );
};

export default FavoritesScreen;
