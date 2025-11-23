import { Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { useParticipatedAuctions } from '@/hooks/queries';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';
import { formatCurrency, formatDate } from '@/utils/format';

const BidsScreen = () => {
  const { colors, palette } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data: participations = [], isLoading, isRefetching, refetch } = useParticipatedAuctions();

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          Mes participations
        </Text>
        <Text style={{ color: colors.textSecondary }}>
          Suis tes offres, ton rang et replonge dans les details en un geste.
        </Text>

        {isLoading ? (
          <LoadingIndicator />
        ) : participations.length === 0 ? (
          <EmptyState
            title="Aucune participation"
            subtitle="Lance-toi sur une enchere active pour apparaitre ici."
          />
        ) : (
          participations.map((auction) => (
            <TouchableOpacity
              key={auction.id}
              onPress={() => navigation.navigate('AuctionDetail', { id: auction.id })}
              activeOpacity={0.9}
            >
              <View
                style={{
                  padding: 16,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  gap: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 }}>
                    {auction.category || 'SmartBid'}
                  </Text>
                  <Text
                    style={{
                      color: auction.status === 'RUNNING' ? palette.success : colors.textSecondary,
                      fontWeight: '700',
                    }}
                  >
                    {auction.status}
                  </Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                  {auction.title}
                </Text>
                <Text style={{ color: colors.textSecondary }} numberOfLines={2}>
                  {auction.description}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Derniere mise</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                      {auction.myLastBidAmount
                        ? formatCurrency(auction.myLastBidAmount, auction.currency)
                        : 'Pas encore de mise'}
                    </Text>
                    {auction.myLastBidAt ? (
                      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                        {formatDate(auction.myLastBidAt)}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Rang</Text>
                    <Text style={{ color: palette.primary, fontWeight: '700' }}>
                      {auction.myRank && auction.myRank > 0 ? `#${auction.myRank}` : 'Non place'}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                      {auction.myBidUnique ? 'Mise unique' : 'Mise partagee'}
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Participants</Text>
                    <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                      {auction.totalBids ?? 0}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        {isRefetching ? (
          <Text style={{ color: colors.textSecondary }}>Mise a jour...</Text>
        ) : (
          <TouchableOpacity onPress={refetch}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>Actualiser</Text>
          </TouchableOpacity>
        )}
      </View>
    </Screen>
  );
};

export default BidsScreen;
