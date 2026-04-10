import { useMemo } from 'react';
import { useCartStore } from '../stores/cart.store';

/**
 * Convenience hook wrapping the cart Zustand store.
 * Provides computed totals for items count and prices.
 */
export function useCart() {
  const { items, addItem, removeItem, updateQuantity, clearCart, getGroupedByShop } =
    useCartStore();

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const totalKrw = useMemo(
    () => items.reduce((sum, item) => sum + item.priceKrw * item.quantity, 0),
    [items],
  );

  const totalCny = useMemo(
    () => items.reduce((sum, item) => sum + item.priceCny * item.quantity, 0),
    [items],
  );

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getGroupedByShop,
    totalItems,
    totalKrw,
    totalCny,
  };
}
