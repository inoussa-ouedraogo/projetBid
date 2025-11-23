import { ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = TextInputProps & {
  label: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
};

export const InputField = ({
  label,
  hint,
  leftIcon,
  rightIcon,
  error,
  ...inputProps
}: Props) => {
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.container, { borderColor: colors.border }]}>
        {leftIcon}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.muted}
          {...inputProps}
        />
        {rightIcon}
      </View>
      {hint ? <Text style={[styles.hint, { color: colors.muted }]}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
  },
});

