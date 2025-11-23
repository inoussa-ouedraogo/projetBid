import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type StatusFilterProps<T extends string> = {
  statuses: readonly T[];
  activeStatus: T;
  onStatusChange: (status: T) => void;
  displayNames?: Record<T, string>;
  horizontal?: boolean;
};

export const StatusFilter = <T extends string>({
  statuses,
  activeStatus,
  onStatusChange,
  displayNames,
  horizontal = false,
}: StatusFilterProps<T>) => {
  const { colors, palette } = useTheme();

  const content = (
    <>
      {statuses.map((item) => {
        const isActive = activeStatus === item;
        return (
          <TouchableOpacity
            key={item}
            style={[
              styles.chip,
              { borderColor: colors.border },
              isActive && [styles.activeChip, { backgroundColor: palette.primary }],
            ]}
            onPress={() => onStatusChange(item)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.textSecondary },
                isActive && styles.activeChipText,
              ]}
            >
              {displayNames?.[item] ?? item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  if (horizontal) {
    return (
      <View style={{ marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 10 }}>
          {content}
        </ScrollView>
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  activeChip: {
    borderWidth: 0,
  },
  chipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  activeChipText: {
    color: '#fff',
    fontWeight: '700',
  },
});
