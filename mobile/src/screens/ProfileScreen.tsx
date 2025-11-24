import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { formatCurrency, formatDate } from '@/utils/format';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { InputField } from '@/components/forms/InputField';

const ProfileScreen = () => {
  const { user, logout, refreshProfile, deleteAccount, updateProfile } = useAuth();
  const { colors, palette } = useTheme();
  const prefersDark = useSettingsStore((state) => state.prefersDark);
  const setPrefersDark = useSettingsStore((state) => state.setPrefersDark);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    confirm: '',
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name ?? '',
        phone: user.phone ?? '',
      }));
    }
  }, [user]);

  const canSave = useMemo(() => {
    if (form.password && form.password !== form.confirm) return false;
    return (
      form.name.trim().length > 0 ||
      form.phone.trim().length > 0 ||
      form.password.trim().length > 0
    );
  }, [form]);

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
              Statut: {user.role} · {user.isVerified ? 'Verifie' : 'Non verifie'}
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
          <TouchableOpacity
            onPress={async () => {
              setRefreshing(true);
              setError('');
              setSuccess('');
              try {
                await refreshProfile();
                setShowEdit(true);
              } catch (err: any) {
                Alert.alert('Erreur', err?.response?.data || 'Impossible d’actualiser maintenant');
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
          >
            <Text style={{ color: refreshing ? colors.muted : palette.primary, fontWeight: '600' }}>
              {refreshing ? 'Actualisation...' : 'Actualiser le profil'}
            </Text>
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

      <Modal visible={showEdit} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 28,
              maxHeight: '85%',
            }}
          >
            <ScrollView contentContainerStyle={{ gap: 14 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                Modifier mes infos
              </Text>
              <InputField
                label="Nom complet"
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
              />
              <InputField
                label="Téléphone"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                placeholder="+225 / +33..."
              />
              <InputField
                label="Nouveau mot de passe"
                secureTextEntry
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                hint="Laisse vide si tu ne changes pas de mot de passe"
              />
              <InputField
                label="Confirme mot de passe"
                secureTextEntry
                value={form.confirm}
                onChangeText={(text) => setForm((prev) => ({ ...prev, confirm: text }))}
              />
              {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
              {success ? <Text style={{ color: palette.success }}>{success}</Text> : null}
              <PrimaryButton
                label="Enregistrer"
                onPress={async () => {
                  if (form.password && form.password !== form.confirm) {
                    setError('Les mots de passe ne correspondent pas');
                    return;
                  }
                  setLoading(true);
                  setError('');
                  setSuccess('');
                  try {
                    await updateProfile({
                      name: form.name.trim() || undefined,
                      phone: form.phone.trim() || undefined,
                      password: form.password.trim() || undefined,
                    });
                    setSuccess('Profil mis à jour');
                    setShowEdit(false);
                    setForm((prev) => ({ ...prev, password: '', confirm: '' }));
                  } catch (e: any) {
                    setError(e?.response?.data || 'Mise à jour impossible');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={!canSave || loading}
                loading={loading}
              />
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>Annuler</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

export default ProfileScreen;
