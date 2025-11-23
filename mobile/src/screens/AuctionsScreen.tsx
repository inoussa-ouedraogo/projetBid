import { useMemo, useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { FlatList, RefreshControl, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { SectionHeader } from '@/components/layout/SectionHeader';
import { usePagedAuctions } from '@/hooks/queries';
import { AuctionStatus } from '@/api/types';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { RootStackParamList } from '@/navigation/types';
import { StatusFilter } from '@/components/common/StatusFilter';

const STATUS_FILTERS = ['ALL', 'RUNNING', 'SCHEDULED', 'FINISHED', 'CANCELED'] as const;
type StatusFilterType = (typeof STATUS_FILTERS)[number];

const AuctionsScreen = () => {
  const [status, setStatus] = useState<StatusFilterType>('RUNNING');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const pagedFilters = useMemo(
    () => ({
      status: status === 'ALL' ? undefined : (status as AuctionStatus),
    }),
    [status]
  );
  const { data, isLoading, refetch, isRefetching } = usePagedAuctions(pagedFilters);

  const auctions = data?.content ?? [];

  const renderListHeader = () => (
    <>
      <SectionHeader
        title="Toutes les encheres"
        subtitle="Filtre par statut pour accelerer tes recherches"
      />
      <StatusFilter
        statuses={STATUS_FILTERS}
        activeStatus={status}
        onStatusChange={setStatus}
        displayNames={{ ALL: 'Tout' }}
        horizontal
      />
    </>
  );

  if (isLoading) {
    return (
      <Screen>
        {renderListHeader()}
        <LoadingIndicator />
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingVertical: 12, gap: 12 }}>
        {renderListHeader()}

        {auctions.length === 0 ? (
          <EmptyState title="Aucune enchere" subtitle="Change les filtres ou reviens plus tard." />
        ) : (
          <FlatList
            horizontal
            data={auctions}
            renderItem={({ item }) => (
              <View style={{ width: 320, marginRight: 16 }}>
                <AuctionCard
                  auction={item}
                  onPress={() => navigation.navigate('AuctionDetail', { id: item.id })}
                />
              </View>
            )}
            keyExtractor={(item) => item.id.toString()}
            showsHorizontalScrollIndicator={false}
            refreshing={isRefetching}
            onRefresh={refetch}
            contentContainerStyle={{ paddingVertical: 10 }}
          />
        )}
      </View>
    </Screen>
  );
};

export default AuctionsScreen;
