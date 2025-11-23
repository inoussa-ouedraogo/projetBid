import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { HeroBanner } from '@/components/hero/HeroBanner';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { useAuctions, useProducts } from '@/hooks/queries';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency } from '@/utils/format';
import { RootStackParamList } from '@/navigation/types';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { SearchBar } from '@/components/forms/SearchBar';

const HomeScreen = () => {
  const { user } = useAuth();
  const { colors, palette } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(timer);
  }, [search]);

  const runningFilters = useMemo(() => ({ status: 'RUNNING' as const }), []);
  const activeFilters = useMemo(
    () => ({
      status: 'RUNNING' as const,
      category: selectedCategory || undefined,
      search: debouncedSearch || undefined,
    }),
    [selectedCategory, debouncedSearch]
  );
  const scheduledFilters = useMemo(() => ({ status: 'SCHEDULED' as const }), []);

  const { data: allRunning = [] } = useAuctions(runningFilters);
  const { data: activeAuctions = [], isLoading: loadingActive } = useAuctions(activeFilters);
  const { data: scheduledAuctions = [] } = useAuctions(scheduledFilters);
  const { data: products = [] } = useProducts();

  const categories = useMemo(
    () => ['Tout', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))],
    [products]
  );

  const countsByCategory = useMemo(
    () =>
      allRunning.reduce<Record<string, number>>((acc, auction) => {
        const cat = auction.category || 'Autres';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {}),
    [allRunning]
  );

  const subtitle =
    debouncedSearch && selectedCategory
      ? `Categorie ${selectedCategory} - filtre "${debouncedSearch}"`
      : debouncedSearch
      ? `Filtre "${debouncedSearch}"`
      : selectedCategory
      ? `Categorie ${selectedCategory}`
      : 'Mises inversees en temps reel';

  return (
    <Screen>
      <View style={{ gap: 24 }}>
        <HeroBanner runningAuctions={allRunning.length} userName={user?.name} />

        <View style={{ gap: 12 }}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Cherche un produit ou une enchere"
            onClear={() => setSearch('')}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {categories.map((category) => {
              const isActive = selectedCategory === category || (category === 'Tout' && !selectedCategory);
              const count = category === 'Tout' ? allRunning.length : countsByCategory[category] ?? 0;
              return (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category === 'Tout' ? null : category)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 999,
                    backgroundColor: isActive ? palette.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? palette.primary : colors.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Text style={{ color: isActive ? colors.surface : colors.textPrimary, fontWeight: '700' }}>
                    {category}
                  </Text>
                  <Text style={{ color: isActive ? colors.surface : colors.textSecondary, fontWeight: '600' }}>
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <SectionHeader
          title={debouncedSearch ? `Resultats pour "${debouncedSearch}"` : 'Encheres actives'}
          subtitle={subtitle}
        />

        {loadingActive ? (
          <LoadingIndicator />
        ) : activeAuctions.length === 0 ? (
          <EmptyState title="Aucune enchere" subtitle="Essaie une autre recherche ou categorie." />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16, paddingHorizontal: 4 }}
          >
            {activeAuctions.map((auction) => (
              <View key={auction.id} style={{ width: 300 }}>
                <AuctionCard
                  auction={auction}
                  onPress={() => navigation.navigate('AuctionDetail', { id: auction.id })}
                />
              </View>
            ))}
          </ScrollView>
        )}

        <SectionHeader
          title="Encheres programmees"
          subtitle="Prepare tes strategies avant ouverture"
        />

        <View style={{ gap: 16 }}>
          {scheduledAuctions.slice(0, 3).map((auction) => (
            <View
              key={auction.id}
              style={{
                padding: 18,
                borderRadius: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.textSecondary, textTransform: 'uppercase' }}>
                {auction.category}
              </Text>

              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                {auction.title}
              </Text>

              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                Participation : {formatCurrency(auction.participationFee, auction.currency)}
              </Text>

              <Text style={{ color: palette.info, marginTop: 6 }}>
                Debute le: {new Date(auction.startAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          ))}

          {scheduledAuctions.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>
              Aucune enchere programmee pour l'instant.
            </Text>
          ) : null}
        </View>
      </View>
    </Screen>
  );
};

export default HomeScreen;
