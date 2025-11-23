import { useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TouchableOpacity, Text, View } from 'react-native';
import { AuthStackParamList } from '@/navigation/types';
import { Screen } from '@/components/layout/Screen';
import { InputField } from '@/components/forms/InputField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { palette, colors } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err?.response?.data || "Impossible d'ouvrir la session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={{ gap: 32 }}>
        <View>
          <Text style={{ color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 2 }}>
            SmartBid Mobile
          </Text>
          <Text style={{ fontSize: 30, fontWeight: '700', color: colors.textPrimary, marginTop: 8 }}>
            Connecte-toi et suis les encheres inversees en direct.
          </Text>
        </View>
        <View style={{ gap: 20 }}>
          <InputField
            label="Email"
            placeholder="ton.email@smartbid.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <InputField
            label="Mot de passe"
            placeholder="********"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? (
            <Text style={{ color: palette.danger, fontSize: 14, fontWeight: '600' }}>{error}</Text>
          ) : null}
          <PrimaryButton
            label="Se connecter"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
          />
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={{ textAlign: 'center', color: palette.primary, fontWeight: '600' }}>
              Nouveau sur SmartBid ? Cree ton compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

export default LoginScreen;
