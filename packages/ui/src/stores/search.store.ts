import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  categoryId?: string;
  minMoq?: number;
  maxMoq?: number;
  verifiedOnly?: boolean;
  freeShipping?: boolean;
}

export type SortBy = 'price_asc' | 'price_desc' | 'sales' | 'newest' | 'rating';

const MAX_RECENT_SEARCHES = 20;

const DEFAULT_FILTERS: SearchFilters = {};

interface SearchState {
  recentSearches: string[];
  filters: SearchFilters;
  sortBy: SortBy;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setSortBy: (sortBy: SortBy) => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      filters: { ...DEFAULT_FILTERS },
      sortBy: 'sales' as SortBy,

      addRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;

          // Remove duplicate and add to front
          const filtered = state.recentSearches.filter((s) => s !== trimmed);
          const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
          return { recentSearches: updated };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

      setSortBy: (sortBy) => set({ sortBy }),
    }),
    {
      name: 'yiwugo-search',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        recentSearches: state.recentSearches,
      }),
    },
  ),
);
