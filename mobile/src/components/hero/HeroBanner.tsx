import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { GavelIcon } from '@/components/icons/GavelIcon';
import { WalletIcon } from '@/components/icons/WalletIcon';
import { RadarIcon } from '@/components/icons/RadarIcon';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  userName?: string;
  runningAuctions: number;
};

export const HeroBanner = ({ userName, runningAuctions }: Props) => {
  const { palette, colors } = useTheme();
  return (
    <LinearGradient colors={[palette.primary, palette.primaryLight]} style={styles.container}>
      <View style={styles.iconsRow}>
        <GavelIcon color="#FDE68A" />
        <WalletIcon />
        <RadarIcon />
      </View>
      <Text style={[styles.title, { color: colors.surface }]}>
        Bonjour {userName ?? 'SmartBidder'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.surface }]}>
        {runningAuctions} encheres actives t'attendent. Rentre dans l'arene et mise intelligemment.
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    padding: 22,
    gap: 12,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.9,
  },
});

