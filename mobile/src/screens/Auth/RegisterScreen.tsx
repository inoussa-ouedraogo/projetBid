import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { AuthStackParamList } from '@/navigation/types';
import { Screen } from '@/components/layout/Screen';
import { InputField } from '@/components/forms/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: Props) => {
  const { palette, colors } = useTheme();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await register({
        ...form,
        consentRgpd: true,
      });
      setMessage(res.message);
    } catch (err: any) {
      setError(err?.response?.data || 'Inscription impossible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.textPrimary }}>
          Cree ton compte SmartBid
        </Text>
        <View style={{ gap: 18 }}>
          <InputField
            label="Nom complet"
            value={form.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          <InputField
            label="Email"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            autoCapitalize="none"
          />
          <InputField
            label="Telephone"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => handleChange('phone', text)}
            placeholder="+33..."
          />
          <InputField
            label="Mot de passe"
            secureTextEntry
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
          />
          {message ? <Text style={{ color: palette.success }}>{message}</Text> : null}
          {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}
          <PrimaryButton
            label="S'inscrire"
            onPress={handleSubmit}
            loading={loading}
            disabled={!form.email || !form.password || !form.name}
          />
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ textAlign: 'center', color: palette.primary, fontWeight: '600' }}>
              Deja membre ? Retour connexion
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

export default RegisterScreen;
