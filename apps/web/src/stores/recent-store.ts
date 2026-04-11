'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentProduct {
  id: string;
  name: string;
  imageUrl: string;
  priceKRW: number;
  priceCNY?: number;
  category?: string;
  viewedAt: string;
}

interface RecentStore {
  items: RecentProduct[];
  addItem: (product: RecentProduct) => void;
  clear: () => void;
}

const MAX_RECENT = 30;

export const useRecentStore = create<RecentStore>()(
  (persist as any)(
    (set: any) => ({
      items: [] as RecentProduct[],

      addItem: (product: RecentProduct) => set((state: RecentStore) => {
        const filtered = state.items.filter((p) => p.id !== product.id);
        return {
          items: [{ ...product, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_RECENT),
        };
      }),

      clear: () => set({ items: [] }),
    }),
    { name: 'yiwugo-recent' }
  )
);
