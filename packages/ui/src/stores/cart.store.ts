import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItemState {
  productId: string;
  productName: string;
  shopId: string;
  shopName: string;
  imageUrl: string;
  priceKrw: number;
  priceCny: number;
  quantity: number;
  options?: Record<string, string>;
  maxQuantity?: number;
  minQuantity?: number;
}

export interface CartGroupedByShop {
  shopId: string;
  shopName: string;
  items: CartItemState[];
  subtotalKrw: number;
  subtotalCny: number;
}

interface CartState {
  items: CartItemState[];
  addItem: (item: CartItemState) => void;
  removeItem: (productId: string, options?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, options?: Record<string, string>) => void;
  clearCart: () => void;
  getGroupedByShop: () => CartGroupedByShop[];
}

/**
 * Generates a unique key for a cart item based on productId and options.
 */
function itemKey(productId: string, options?: Record<string, string>): string {
  if (!options || Object.keys(options).length === 0) return productId;
  const sorted = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join('|');
  return `${productId}__${sorted}`;
}

function matches(
  item: CartItemState,
  productId: string,
  options?: Record<string, string>,
): boolean {
  return itemKey(item.productId, item.options) === itemKey(productId, options);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) =>
        set((state) => {
          const existingIdx = state.items.findIndex((i) =>
            matches(i, newItem.productId, newItem.options),
          );

          if (existingIdx >= 0) {
            const updated = [...state.items];
            const existing = updated[existingIdx];
            let newQty = existing.quantity + newItem.quantity;

            // Respect max quantity
            if (existing.maxQuantity) {
              newQty = Math.min(newQty, existing.maxQuantity);
            }

            updated[existingIdx] = { ...existing, quantity: newQty };
            return { items: updated };
          }

          // Respect min quantity for new items
          const qty = newItem.minQuantity
            ? Math.max(newItem.quantity, newItem.minQuantity)
            : newItem.quantity;

          return {
            items: [...state.items, { ...newItem, quantity: qty }],
          };
        }),

      removeItem: (productId, options) =>
        set((state) => ({
          items: state.items.filter((i) => !matches(i, productId, options)),
        })),

      updateQuantity: (productId, quantity, options) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter((i) => !matches(i, productId, options)),
            };
          }

          return {
            items: state.items.map((item) => {
              if (!matches(item, productId, options)) return item;

              let qty = quantity;
              if (item.minQuantity) qty = Math.max(qty, item.minQuantity);
              if (item.maxQuantity) qty = Math.min(qty, item.maxQuantity);

              return { ...item, quantity: qty };
            }),
          };
        }),

      clearCart: () => set({ items: [] }),

      getGroupedByShop: () => {
        const { items } = get();
        const shopMap = new Map<string, CartGroupedByShop>();

        for (const item of items) {
          const existing = shopMap.get(item.shopId);
          if (existing) {
            existing.items.push(item);
            existing.subtotalKrw += item.priceKrw * item.quantity;
            existing.subtotalCny += item.priceCny * item.quantity;
          } else {
            shopMap.set(item.shopId, {
              shopId: item.shopId,
              shopName: item.shopName,
              items: [item],
              subtotalKrw: item.priceKrw * item.quantity,
              subtotalCny: item.priceCny * item.quantity,
            });
          }
        }

        return Array.from(shopMap.values());
      },
    }),
    {
      name: 'yiwugo-cart',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        // SSR fallback: noop storage
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    },
  ),
);
