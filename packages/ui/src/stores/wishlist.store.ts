import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface WishlistItemState {
  productId: string;
  productName: string;
  imageUrl: string;
  priceKrw: number;
  priceCny: number;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItemState[];
  addItem: (item: WishlistItemState) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItemState) => void;
  isWishlisted: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.productId === item.productId)) {
            return state; // Already exists
          }
          return { items: [...state.items, item] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((i) => i.productId === item.productId);
          if (exists) {
            return {
              items: state.items.filter((i) => i.productId !== item.productId),
            };
          }
          return { items: [...state.items, item] };
        }),

      isWishlisted: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },
    }),
    {
      name: 'yiwugo-wishlist',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    },
  ),
);
