'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  imageUrl: string;
  priceKrw: number;
  priceCny: number;
  quantity: number;
  options?: string;
  minOrderQty: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalKrw: () => number;
  totalCny: () => number;
  getGroupedByShop: () => Record<string, CartItem[]>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const id = `${item.productId}-${item.options || 'default'}`;
        set((state) => {
          const existing = state.items.find(i => i.id === id);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        });
      },
      removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity: Math.max(i.minOrderQty, quantity) } : i),
      })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalKrw: () => get().items.reduce((sum, i) => sum + i.priceKrw * i.quantity, 0),
      totalCny: () => get().items.reduce((sum, i) => sum + i.priceCny * i.quantity, 0),
      getGroupedByShop: () => {
        const grouped: Record<string, CartItem[]> = {};
        for (const item of get().items) {
          const key = item.shopId;
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        }
        return grouped;
      },
    }),
    { name: 'yiwugo-cart' }
  )
);
