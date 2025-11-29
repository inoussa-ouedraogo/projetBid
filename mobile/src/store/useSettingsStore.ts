import { create } from 'zustand';

type SettingsState = {
  prefersDark: boolean | null;
  accent: 'violet' | 'teal' | 'amber';
  auctionScope: 'city' | 'country';
  setPrefersDark: (value: boolean) => void;
  setAccent: (accent: SettingsState['accent']) => void;
  setAuctionScope: (scope: 'city' | 'country') => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  prefersDark: null,
  accent: 'violet',
  auctionScope: 'country',
  setPrefersDark: (prefersDark) => set({ prefersDark }),
  setAccent: (accent) => set({ accent }),
  setAuctionScope: (auctionScope) => set({ auctionScope }),
}));
