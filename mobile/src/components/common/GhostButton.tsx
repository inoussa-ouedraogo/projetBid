import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
};

export const GhostButton = ({ label, onPress, icon }: Props) => {
  const { colors, palette } = useTheme();
  return (
    <TouchableOpacity
      style={[styles.container, { borderColor: palette.primary }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {icon}
      <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  label: {
    fontWeight: '600',
  },
});

