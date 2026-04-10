'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const getGroupedByShop = useCartStore((s) => s.getGroupedByShop);
  const showToast = useUIStore((s) => s.showToast);

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Select all items by default when items change
  useEffect(() => {
    setSelectedItems(new Set(items.map((i) => i.id)));
  }, [items]);

  const grouped = useMemo(() => getGroupedByShop(), [items, getGroupedByShop]);

  const allSelected = items.length > 0 && items.every((item) => selectedItems.has(item.id));
  const selectedCount = items.filter((item) => selectedItems.has(item.id)).length;

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShop = (shopId: string) => {
    const shopItems = grouped[shopId] || [];
    const shopItemIds = shopItems.map((i) => i.id);
    const allShopSelected = shopItemIds.every((id) => selectedItems.has(id));
    setSelectedItems((prev) => {
      const next = new Set(prev);
      shopItemIds.forEach((id) => {
        if (allShopSelected) next.delete(id);
        else next.add(id);
      });
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((i) => i.id)));
    }
  };

  const handleRemove = (id: string) => {
    removeItem(id);
    showToast('상품이 삭제되었습니다', 'info');
  };

  const totalKRW = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceKrw * item.quantity, 0);

  const totalCNY = items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceCny * item.quantity, 0);

  const isEmpty = items.length === 0;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface max-w-3xl mx-auto">
        <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md px-5 py-3 border-b border-outline-variant/30">
          <h1 className="font-heading text-xl font-bold">장바구니</h1>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md px-5 py-3 border-b border-outline-variant/30">
        <h1 className="font-heading text-xl font-bold">
          장바구니
          {!isEmpty && (
            <span className="text-on-surface-variant font-normal text-base ml-2">
              ({items.length})
            </span>
          )}
        </h1>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-5">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px]">
              shopping_cart
            </span>
          </div>
          <h2 className="font-heading text-lg font-bold text-on-surface mb-2">
            장바구니가 비어있어요
          </h2>
          <p className="text-sm text-on-surface-variant text-center mb-6">
            마음에 드는 상품을 담아보세요
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all active:scale-[0.98]"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <>
          {/* Cart items grouped by shop */}
          <div className="px-4 py-4 space-y-4 pb-40">
            {Object.entries(grouped).map(([shopId, shopItems]) => {
              const shopName = shopItems[0]?.shopName || shopId;
              const shopItemIds = shopItems.map((i) => i.id);
              const allShopSelected = shopItemIds.every((id) => selectedItems.has(id));

              return (
                <div key={shopId} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft">
                  {/* Shop header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">
                    <button
                      onClick={() => toggleShop(shopId)}
                      className={cn(
                        'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                        allShopSelected
                          ? 'bg-primary border-primary'
                          : 'border-outline-variant bg-transparent'
                      )}
                    >
                      {allShopSelected && (
                        <span className="material-symbols-outlined text-white text-[14px]">check</span>
                      )}
                    </button>
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">store</span>
                    <span className="text-sm font-semibold text-on-surface">{shopName}</span>
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px] ml-auto">
                      chevron_right
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-outline-variant/20">
                    {shopItems.map((item) => (
                      <div key={item.id} className="flex gap-3 p-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={cn(
                            'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-1',
                            selectedItems.has(item.id)
                              ? 'bg-primary border-primary'
                              : 'border-outline-variant bg-transparent'
                          )}
                        >
                          {selectedItems.has(item.id) && (
                            <span className="material-symbols-outlined text-white text-[14px]">check</span>
                          )}
                        </button>

                        {/* Thumbnail */}
                        <div className="w-20 h-20 rounded-xl bg-surface-container overflow-hidden shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant/30 text-[32px]">image</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight">
                              {item.productName}
                            </h3>
                            <button
                              onClick={() => handleRemove(item.id)}
                              className="text-on-surface-variant/50 hover:text-error transition-colors shrink-0"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                          {item.options && (
                            <p className="text-xs text-on-surface-variant mt-1">{item.options}</p>
                          )}

                          <div className="flex items-end justify-between mt-2">
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {(item.priceKrw * item.quantity).toLocaleString()}원
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                ¥{(item.priceCny * item.quantity).toLocaleString()}
                              </p>
                            </div>

                            {/* Quantity stepper */}
                            <div className="flex items-center gap-0 border border-outline-variant/40 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom action bar */}
          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 shadow-strong">
            <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
              {/* Select all */}
              <label className="flex items-center gap-2 cursor-pointer shrink-0">
                <button
                  onClick={toggleAll}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
                    allSelected
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant bg-transparent'
                  )}
                >
                  {allSelected && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>
                <span className="text-sm text-on-surface-variant">
                  전체 ({selectedCount})
                </span>
              </label>

              {/* Total */}
              <div className="flex-1 text-right">
                <p className="text-base font-bold text-on-surface">
                  {totalKRW.toLocaleString()}원
                </p>
                <p className="text-xs text-on-surface-variant">
                  ¥{totalCNY.toLocaleString()}
                </p>
              </div>

              {/* Checkout button */}
              <Link
                href="/checkout"
                className={cn(
                  'px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 shrink-0',
                  selectedCount > 0
                    ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
                    : 'bg-outline-variant/60 pointer-events-none'
                )}
              >
                주문하기 ({selectedCount})
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
