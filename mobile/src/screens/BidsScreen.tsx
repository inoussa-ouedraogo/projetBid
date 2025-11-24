import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Swipeable } from 'react-native-gesture-handler';
import { Screen } from '@/components/layout/Screen';
import { useParticipatedAuctions, useMyPurchases } from '@/hooks/queries';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { RootStackParamList } from '@/navigation/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { useHistoryStore } from '@/store/useHistoryStore';

type TabKey = 'participations' | 'purchases';

const BidsScreen = () => {
  const { colors, palette } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [tab, setTab] = useState<TabKey>('participations');
  const { data: participations = [], isLoading, isRefetching, refetch } = useParticipatedAuctions();
  const purchasesQuery = useMyPurchases();
  const hiddenParticipations = useHistoryStore((state) => state.hiddenParticipations);
  const hideParticipation = useHistoryStore((state) => state.hideParticipation);
  const resetHidden = useHistoryStore((state) => state.resetHidden);

  const purchaseCards = useMemo(() => purchasesQuery.data ?? [], [purchasesQuery.data]);
  const visibleParticipations = useMemo(
    () => participations.filter((a) => !hiddenParticipations.includes(a.id)),
    [participations, hiddenParticipations]
  );

  const tabs = [
    { key: 'participations', label: 'Mes participations' },
    { key: 'purchases', label: 'Mes achats' },
  ];

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
          Historique
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={() => setTab(t.key as TabKey)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: active ? palette.primary : colors.border,
                  backgroundColor: active ? palette.primary + '15' : colors.surface,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: active ? palette.primary : colors.textPrimary, fontWeight: '700' }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {tab === 'participations' ? (
          isLoading ? (
            <LoadingIndicator />
          ) : visibleParticipations.length === 0 ? (
            <EmptyState
              title="Aucune participation"
              subtitle="Place une mise sur une enchère pour la retrouver ici."
            />
          ) : (
            <ScrollView contentContainerStyle={{ gap: 16, paddingTop: 6 }}>
              {visibleParticipations.map((auction) => (
                <Swipeable
                  key={auction.id}
                  onSwipeableOpen={(dir) => {
                    if (dir === 'left' || dir === 'right') {
                      hideParticipation(auction.id);
                    }
                  }}
                  renderLeftActions={() => (
                    <View
                      style={{
                        width: 80,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: palette.primary + '22',
                      }}
                    >
                      <Text style={{ color: palette.primary, fontWeight: '700' }}>Masquer</Text>
                    </View>
                  )}
                  renderRightActions={() => (
                    <View
                      style={{
                        width: 80,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Masquer</Text>
                    </View>
                  )}
                >
                  <AuctionCard
                    auction={auction}
                    onPress={() => navigation.navigate('AuctionDetail', { id: auction.id })}
                  />
                </Swipeable>
              ))}
              {isRefetching ? (
                <Text style={{ color: colors.textSecondary }}>Mise à jour...</Text>
              ) : (
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity onPress={refetch}>
                    <Text style={{ color: palette.primary, fontWeight: '600' }}>Rafraîchir</Text>
                  </TouchableOpacity>
                  {hiddenParticipations.length > 0 ? (
                    <TouchableOpacity onPress={resetHidden}>
                      <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
                        Réinitialiser les masqués
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}
            </ScrollView>
          )
        ) : null}

        {tab === 'purchases' ? (
          purchasesQuery.isLoading ? (
            <LoadingIndicator />
          ) : purchaseCards.length === 0 ? (
            <EmptyState title="Aucun achat" subtitle="Valide un achat immédiat pour le voir ici." />
          ) : (
            <ScrollView contentContainerStyle={{ gap: 12, paddingTop: 6 }}>
              {purchaseCards.map((p) => (
                <View
                  key={p.id}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    gap: 6,
                  }}
                >
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    Achat #{p.id} · {formatDate(p.createdAt)}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>
                    {p.auctionTitle}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>{p.productTitle}</Text>
                  <Text style={{ color: colors.textSecondary }}>
                    Livré à : {p.fullName} — {p.address}, {p.city}
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    Contact : {p.phone} {p.buyerEmail ? `· ${p.buyerEmail}` : ''}
                  </Text>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 6,
                    }}
                  >
                    <Text style={{ color: colors.textSecondary }}>Paiement</Text>
                    <Text style={{ color: palette.primary, fontWeight: '700' }}>
                      {p.paymentMethod === 'ORANGE_MONEY' ? 'Orange Money' : 'Paiement à la livraison'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )
        ) : null}
      </View>
    </Screen>
  );
};

export default BidsScreen;
