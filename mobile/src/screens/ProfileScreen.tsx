import { Alert, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatDate } from '@/utils/format';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useSettingsStore } from '@/store/useSettingsStore';

const ProfileScreen = () => {
  const { user, logout, refreshProfile, deleteAccount } = useAuth();
  const { colors, palette } = useTheme();
  const prefersDark = useSettingsStore((state) => state.prefersDark);
  const setPrefersDark = useSettingsStore((state) => state.setPrefersDark);

  if (!user) {
    return null;
  }

  const initials =
    user.name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'SB';

  const handleDelete = () => {
    Alert.alert(
      'Supprimer mon compte',
      'Cette action anonymise ton compte et te deconnecte.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Compte supprime', 'Ton profil a ete supprime de SmartBid.');
            } catch (error: any) {
              const message = error?.response?.data || 'Suppression impossible pour le moment.';
              Alert.alert('Erreur', String(message));
            }
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <View style={{ gap: 20 }}>
        <View
          style={{
            padding: 24,
            borderRadius: 28,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 14,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: palette.primary + '22',
            }}
          >
            <Text style={{ color: palette.primary, fontWeight: '800', fontSize: 20 }}>{initials}</Text>
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.textPrimary }}>
              {user.name}
            </Text>
            <Text style={{ color: colors.textSecondary }}>{user.email}</Text>
            <Text style={{ color: colors.textSecondary }}>
              Statut: {user.role} • {user.isVerified ? 'Verifie' : 'Non verifie'}
            </Text>
            <Text style={{ color: colors.textSecondary }}>
              Compte cree le {formatDate(user.createdAt)}
            </Text>
          </View>
        </View>

        <View
          style={{
            padding: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: palette.secondary + '15',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Ton solde SmartBid
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: palette.secondary }}>
            {formatCurrency(user.walletBalance)}
          </Text>
          <Text style={{ color: colors.textSecondary }}>
            Utilise ton solde pour couvrir les frais de participation aux encheres inversees.
          </Text>
        </View>

        <View
          style={{
            padding: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
            Preferences
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ color: colors.textSecondary }}>Mode sombre</Text>
            <Switch value={prefersDark ?? false} onValueChange={setPrefersDark} />
          </View>
          <TouchableOpacity onPress={refreshProfile}>
            <Text style={{ color: palette.primary, fontWeight: '600' }}>Actualiser le profil</Text>
          </TouchableOpacity>
        </View>

        <PrimaryButton label="Se deconnecter" onPress={logout} />

        <TouchableOpacity
          onPress={handleDelete}
          style={{
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: palette.danger,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: palette.danger, fontWeight: '700' }}>Supprimer mon compte</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

export default ProfileScreen;
