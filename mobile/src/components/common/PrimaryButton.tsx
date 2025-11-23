import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export const PrimaryButton = ({ label, onPress, disabled, loading, icon }: Props) => {
  const { colors, palette, typography } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: palette.primary, opacity: disabled ? 0.5 : 1 },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: colors.surface, fontSize: typography.body }]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
});

