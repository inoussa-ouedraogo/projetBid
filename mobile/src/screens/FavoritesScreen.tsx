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
import { useAuctionLocation } from '@/hooks/useAuctionLocation';
import { LocationScopeToggle } from '@/components/common/LocationScopeToggle';

const FavoritesScreen = () => {
  const { colors } = useTheme();
  const { scope, setScope, city, cityFilter } = useAuctionLocation();
  const favorites = useFavoritesStore((state) => state.favorites);
  const { data: allAuctions = [], isLoading } = useAuctions({ city: cityFilter });
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const favoriteAuctions = useMemo(
    () => allAuctions.filter((a) => favorites.includes(a.id)),
    [allAuctions, favorites]
  );
  const emptySubtitle =
    favorites.length > 0
      ? 'Aucun favori dans cette zone. Passe sur "Tout le pays" pour les voir.'
      : 'Ajoute des enchères depuis la liste ou le détail.';

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          Mes favoris
        </Text>
        <LocationScopeToggle city={city} scope={scope} onChange={setScope} />
        <Text style={{ color: colors.textSecondary }}>
          Retrouve rapidement les enchères que tu as mises de côté pour enchérir plus tard.
        </Text>

        {isLoading ? (
          <LoadingIndicator />
        ) : favoriteAuctions.length === 0 ? (
          <EmptyState title="Aucun favori" subtitle={emptySubtitle} />
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
