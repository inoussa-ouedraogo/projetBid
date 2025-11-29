import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSettingsStore } from '@/store/useSettingsStore';

export const useAuctionLocation = () => {
  const { user } = useAuth();
  const scope = useSettingsStore((state) => state.auctionScope);
  const setScope = useSettingsStore((state) => state.setAuctionScope);

  const city = user?.city?.trim();
  const canUseCity = Boolean(city);
  const effectiveScope = canUseCity ? scope : 'country';
  const cityFilter = effectiveScope === 'city' && canUseCity ? city : undefined;

  return useMemo(
    () => ({
      scope: effectiveScope,
      setScope,
      city,
      canUseCity,
      cityFilter,
    }),
    [effectiveScope, setScope, city, canUseCity, cityFilter]
  );
};
