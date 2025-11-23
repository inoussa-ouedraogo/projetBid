import { create } from 'zustand';

type SettingsState = {
  prefersDark: boolean | null;
  accent: 'violet' | 'teal' | 'amber';
  setPrefersDark: (value: boolean) => void;
  setAccent: (accent: SettingsState['accent']) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  prefersDark: null,
  accent: 'violet',
  setPrefersDark: (prefersDark) => set({ prefersDark }),
  setAccent: (accent) => set({ accent }),
}));
