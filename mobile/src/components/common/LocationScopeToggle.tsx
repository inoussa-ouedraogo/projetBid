import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { formatCity } from '@/utils/format';

type Props = {
  city?: string;
  scope: 'city' | 'country';
  onChange: (scope: 'city' | 'country') => void;
};

export const LocationScopeToggle = ({ city, scope, onChange }: Props) => {
  const { colors, palette } = useTheme();
  const hasCity = Boolean(city);
  const pillStyle = (active: boolean, disabled?: boolean) => ({
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: active ? palette.primary : colors.border,
    backgroundColor: active ? palette.primary + '15' : colors.surface,
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TouchableOpacity
          disabled={!hasCity}
          onPress={() => onChange('city')}
          style={pillStyle(scope === 'city', !hasCity)}
          activeOpacity={0.85}
        >
          <Ionicons
            name="navigate-outline"
            size={16}
            color={scope === 'city' ? palette.primary : colors.textSecondary}
          />
          <Text
            style={{
              color: scope === 'city' ? palette.primary : colors.textPrimary,
              fontWeight: '700',
            }}
          >
            Ma ville{hasCity ? ` (${formatCity(city)})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange('country')}
          style={pillStyle(scope === 'country')}
          activeOpacity={0.85}
        >
          <Ionicons
            name="earth-outline"
            size={16}
            color={scope === 'country' ? palette.primary : colors.textSecondary}
          />
          <Text
            style={{
              color: scope === 'country' ? palette.primary : colors.textPrimary,
              fontWeight: '700',
            }}
          >
            Tout le pays
          </Text>
        </TouchableOpacity>
      </View>
      {!hasCity ? (
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Ajoute ta ville dans ton profil pour filtrer les enchères locales.
        </Text>
      ) : null}
    </View>
  );
};
