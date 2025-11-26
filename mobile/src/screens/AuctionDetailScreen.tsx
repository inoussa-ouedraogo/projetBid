import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Text, TextInput, TouchableOpacity, View, ScrollView, Share } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { RootStackParamList } from '@/navigation/types';
import {
  useAuctionBids,
  useAuctionDetail,
  useAuctions,
  useBidMutation,
  useMyRank,
} from '@/hooks/queries';
import { useBuyNowMutation } from '@/hooks/queries';
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';
import { formatCurrency, formatDate } from '@/utils/format';
import { resolveImageUrl } from '@/utils/media';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { BidCard } from '@/components/cards/BidCard';
import { AuctionCard } from '@/components/cards/AuctionCard';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BuyNowPayload } from '@/api/types';

type TabKey = 'bids' | 'similar' | 'rank';

const AuctionDetailScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'AuctionDetail'>>();
  const { colors, palette } = useTheme();
  const { data: auction, isLoading } = useAuctionDetail(route.params?.id);
  const { data: bids = [], refetch: refetchBids } = useAuctionBids(route.params?.id);
  const [amount, setAmount] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('bids');
  const [buyForm, setBuyForm] = useState<BuyNowPayload>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'ORANGE_MONEY',
  });
  const [showBuyForm, setShowBuyForm] = useState(false);
  const bidMutation = useBidMutation(route.params?.id as number);
  const rank = useMyRank(route.params?.id);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const buyNowMutation = useBuyNowMutation(route.params?.id as number);
  const buyNowPrice = auction?.buyNowPrice ?? auction?.minBid ?? auction?.maxBid;
  const { user } = useAuth();

  const similarFilters = useMemo(
    () =>
      auction?.category
        ? { status: 'RUNNING' as const, category: auction.category }
        : { status: 'RUNNING' as const },
    [auction?.category]
  );
  const similarQuery = useAuctions(similarFilters);

  const similarAuctions = useMemo(
    () => (similarQuery.data || []).filter((item) => item.id !== auction?.id).slice(0, 4),
    [auction?.id, similarQuery.data]
  );

  const isRunning = auction?.status === 'RUNNING';

  const minMaxLabel = useMemo(() => {
    if (!auction) return '--';
    return `${formatCurrency(auction.minBid, auction.currency)} - ${formatCurrency(
      auction.maxBid,
      auction.currency
    )}`;
  }, [auction]);

  const handleBid = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!value || !route.params?.id) {
      Alert.alert('Montant invalide', 'Ajoute un montant dans la fenetre autorisee.');
      return;
    }
    try {
      await bidMutation.mutateAsync({ amount: value });
      setAmount('');
      await refetchBids();
      rank.refetch();
      Alert.alert('Mise envoyee', 'Ta mise est enregistree. Surveille ton rang !');
    } catch (error: any) {
      const message = error?.response?.data || 'Impossible de placer la mise';
      Alert.alert('Erreur', String(message));
    }
  };

  if (isLoading || !auction) {
    return (
      <Screen>
        <LoadingIndicator />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 20 }}>
        {auction.imageUrl ? (
          <Image
            source={{ uri: resolveImageUrl(auction.imageUrl) }}
            style={{ width: '100%', height: 220, borderRadius: 24 }}
          />
        ) : null}

        <View
          style={{
            padding: 20,
            borderRadius: 24,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 10,
          }}
        >
          <Text style={{ color: colors.textSecondary, textTransform: 'uppercase' }}>
            {auction.category}
          </Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>
            {auction.title}
          </Text>
          <Text style={{ color: colors.textSecondary }}>{auction.description}</Text>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Participation</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
                {formatCurrency(auction.participationFee, auction.currency)}
              </Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Fenetre de mise</Text>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
                {minMaxLabel}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Ouverture</Text>
              <Text style={{ color: colors.textPrimary }}>{formatDate(auction.startAt)}</Text>
            </View>
            <View>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Cloture</Text>
              <Text style={{ color: colors.textPrimary }}>{formatDate(auction.endAt)}</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            padding: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 12,
            backgroundColor: palette.primary + '10',
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Placer une mise
          </Text>

          <TextInput
            placeholder={`Montant (${auction.currency})`}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
            style={{
              padding: 14,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              color: colors.textPrimary,
            }}
          />

          <PrimaryButton
            label={isRunning ? 'Valider ma mise' : 'Enchere non ouverte'}
            onPress={handleBid}
            disabled={!isRunning || !amount}
            loading={bidMutation.isPending}
          />
          {buyNowPrice ? (
            <PrimaryButton
              label={`Acheter maintenant (${formatCurrency(buyNowPrice, auction.currency)})`}
              onPress={() => setShowBuyForm(true)}
              disabled={buyNowMutation.isPending}
              loading={buyNowMutation.isPending}
            />
          ) : null}
          <PrimaryButton
            label="Partager l'offre"
            onPress={async () => {
              try {
                const url = auction.imageUrl ? resolveImageUrl(auction.imageUrl) : undefined;
                await Share.share({
                  message: `SmartBid · ${auction.title} · Mise min ${formatCurrency(
                    auction.minBid,
                    auction.currency
                  )} · Fin ${formatDate(auction.endAt)}`,
                  url,
                });
              } catch {
                // no-op
              }
            }}
          />
        </View>

        {buyNowPrice ? (
          <Modal visible={showBuyForm} animationType="slide" transparent>
            <View
              style={{
                flex: 1,
                backgroundColor: '#00000055',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.surface,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                  padding: 20,
                  maxHeight: '85%',
                }}
              >
                <ScrollView contentContainerStyle={{ gap: 12 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                    Acheter maintenant
                  </Text>
                  <Text style={{ color: colors.textSecondary }}>
                    Prix: {formatCurrency(buyNowPrice, auction.currency)}
                  </Text>

                  <TextInput
                    placeholder="Nom complet"
                    placeholderTextColor={colors.muted}
                    value={buyForm.fullName}
                    onChangeText={(text) => setBuyForm((prev) => ({ ...prev, fullName: text }))}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.elevated,
                    }}
                  />
                  <TextInput
                    placeholder="Téléphone"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.muted}
                    value={buyForm.phone}
                    onChangeText={(text) => setBuyForm((prev) => ({ ...prev, phone: text }))}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.elevated,
                    }}
                  />
                  <TextInput
                    placeholder="Adresse"
                    placeholderTextColor={colors.muted}
                    value={buyForm.address}
                    onChangeText={(text) => setBuyForm((prev) => ({ ...prev, address: text }))}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.elevated,
                    }}
                  />
                  <TextInput
                    placeholder="Ville"
                    placeholderTextColor={colors.muted}
                    value={buyForm.city}
                    onChangeText={(text) => setBuyForm((prev) => ({ ...prev, city: text }))}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      color: colors.textPrimary,
                      backgroundColor: colors.elevated,
                    }}
                  />

                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[
                      { key: 'ORANGE_MONEY', label: 'Orange Money' },
                      { key: 'CASH_ON_DELIVERY', label: 'Paiement à la livraison' },
                    ].map((pm) => {
                      const active = buyForm.paymentMethod === pm.key;
                      return (
                        <TouchableOpacity
                          key={pm.key}
                          onPress={() =>
                            setBuyForm((prev) => ({ ...prev, paymentMethod: pm.key as any }))
                          }
                          style={{
                            flex: 1,
                            padding: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: active ? palette.primary : colors.border,
                            backgroundColor: active ? palette.primary + '15' : colors.surface,
                            alignItems: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: active ? palette.primary : colors.textPrimary,
                              fontWeight: '700',
                            }}
                          >
                            {pm.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <PrimaryButton
                    label="Confirmer l'achat"
                    onPress={async () => {
                      try {
                        await buyNowMutation.mutateAsync(buyForm);
                        Alert.alert('Achat confirme', 'Le produit est reserve pour toi.');
                        setShowBuyForm(false);
                      } catch (error: any) {
                        const message = error?.response?.data || 'Achat impossible pour le moment';
                        Alert.alert('Erreur', String(message));
                      }
                    }}
                    disabled={buyNowMutation.isPending}
                    loading={buyNowMutation.isPending}
                  />
                  <TouchableOpacity onPress={() => setShowBuyForm(false)}>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Annuler</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        ) : null}

        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[
            { key: 'bids', label: 'Historique' },
            { key: 'similar', label: 'Similaires' },
            { key: 'rank', label: 'Mon rang' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as TabKey)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 14,
                  backgroundColor: isActive ? palette.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: isActive ? palette.primary : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: isActive ? colors.surface : colors.textPrimary,
                    fontWeight: '700',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {activeTab === 'bids' ? (
          <View style={{ gap: 12 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textPrimary,
                marginBottom: 4,
              }}
            >
              Historique des mises
            </Text>

            {bids.filter((b) => !user || b.userEmail === user.email).length === 0 ? (
              <EmptyState title="Pas encore de mise" subtitle="Sois le premier a tenter ta chance." />
            ) : (
              bids
                .filter((b) => !user || b.userEmail === user.email)
                .map((bid) => <BidCard key={bid.id} bid={bid} />)
            )}
          </View>
        ) : null}

        {activeTab === 'similar' ? (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
              Produits similaires
            </Text>
            {similarQuery.isLoading ? (
              <LoadingIndicator />
            ) : similarAuctions.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>
                Pas d autres encheres dans cette categorie pour le moment.
              </Text>
            ) : (
              similarAuctions.map((item) => (
                <AuctionCard
                  key={item.id}
                  auction={item}
                  onPress={() => navigation.replace('AuctionDetail', { id: item.id })}
                />
              ))
            )}
          </View>
        ) : null}

        {activeTab === 'rank' ? (
          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
              Mon rang et notifications
            </Text>
            {rank.isLoading ? (
              <LoadingIndicator />
            ) : (
              <View
                style={{
                  padding: 16,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  gap: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  Derniere mise: {rank.data?.myBidAmount ? formatCurrency(rank.data.myBidAmount, auction.currency) : 'Aucune'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Rang actuel: {rank.data?.myRank && rank.data.myRank > 0 ? `#${rank.data.myRank}` : 'Non classe'}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Total participants: {rank.data?.totalBids ?? 0}
                </Text>
                <Text style={{ color: colors.textSecondary }}>
                  Mise unique ? {rank.data?.myBidUnique ? 'Oui' : 'Non'}
                </Text>
                <TouchableOpacity onPress={() => rank.refetch()}>
                  <Text style={{ color: palette.primary, fontWeight: '600' }}>Actualiser mon rang</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </Screen>
  );
};

export default AuctionDetailScreen;
