'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  productId: string;
  productName: string;
  imageUrl: string;
  priceKrw: number;
  priceCny: number;
  category: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (productId: string) => boolean;
  totalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        if (state.items.find(i => i.productId === item.productId)) return state;
        return { items: [...state.items, { ...item, addedAt: new Date().toISOString() }] };
      }),
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId),
      })),
      toggleItem: (item) => {
        if (get().isWishlisted(item.productId)) {
          get().removeItem(item.productId);
        } else {
          get().addItem(item);
        }
      },
      isWishlisted: (productId) => get().items.some(i => i.productId === productId),
      totalItems: () => get().items.length,
    }),
    { name: 'yiwugo-wishlist' }
  )
);
