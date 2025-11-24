import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type HistoryState = {
  hiddenParticipations: number[];
  hideParticipation: (id: number) => void;
  resetHidden: () => void;
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      hiddenParticipations: [],
      hideParticipation: (id) =>
        set((state) =>
          state.hiddenParticipations.includes(id)
            ? state
            : { hiddenParticipations: [...state.hiddenParticipations, id] }
        ),
      resetHidden: () => set({ hiddenParticipations: [] }),
    }),
    {
      name: 'smartbid-history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ hiddenParticipations: state.hiddenParticipations }),
    }
  )
);
