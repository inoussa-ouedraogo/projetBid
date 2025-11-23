import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type FavoritesState = {
  favorites: number[];
  add: (id: number) => void;
  remove: (id: number) => void;
  toggle: (id: number) => void;
  clear: () => void;
  isFavorite: (id: number) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      add: (id) =>
        set((state) =>
          state.favorites.includes(id) ? state : { favorites: [...state.favorites, id] }
        ),
      remove: (id) =>
        set((state) => ({ favorites: state.favorites.filter((fav) => fav !== id) })),
      toggle: (id) => {
        const { favorites } = get();
        if (favorites.includes(id)) {
          set({ favorites: favorites.filter((fav) => fav !== id) });
        } else {
          set({ favorites: [...favorites, id] });
        }
      },
      clear: () => set({ favorites: [] }),
      isFavorite: (id) => get().favorites.includes(id),
    }),
    {
      name: 'smartbid-favorites',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    }
  )
);
