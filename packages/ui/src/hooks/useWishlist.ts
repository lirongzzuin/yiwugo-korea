import { useCallback } from 'react';
import type { Product } from '@yiwugo/shared';
import { useWishlistStore, type WishlistItemState } from '../stores/wishlist.store';

/**
 * Wishlist hook wrapping the wishlist Zustand store.
 */
export function useWishlist() {
  const { items, addItem, removeItem, toggleItem, isWishlisted } =
    useWishlistStore();

  const isWishlistedFn = useCallback(
    (productId: string): boolean => isWishlisted(productId),
    [isWishlisted],
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const item: WishlistItemState = {
        productId: product.id,
        productName: product.titleKo,
        imageUrl: product.imageUrls[0] ?? '',
        priceKrw: Number(product.priceKrw) || 0,
        priceCny: Number(product.priceOriginalCny) || 0,
        addedAt: new Date().toISOString(),
      };
      toggleItem(item);
    },
    [toggleItem],
  );

  return {
    items,
    addItem,
    removeItem,
    isWishlisted: isWishlistedFn,
    toggleWishlist,
  };
}
