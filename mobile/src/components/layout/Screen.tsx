import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  safe?: boolean;
  padding?: number;
  background?: string;
};

export const Screen = ({
  children,
  scrollable = true,
  padding = 20,
  background,
}: Props) => {
  const { colors } = useTheme();
  const Wrapper = scrollable ? ScrollView : View;
  const wrapperProps = scrollable
    ? {
        contentContainerStyle: [styles.content] as StyleProp<ViewStyle>,
      }
    : undefined;
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: background || colors.background }]}>
      <Wrapper
        style={[
          styles.container,
          { paddingHorizontal: padding, backgroundColor: background || colors.background },
        ]}
        {...(wrapperProps as any)}
      >
        {children}
      </Wrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    gap: 16,
  },
});
