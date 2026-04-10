'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useCartStore } from '@/stores/cart-store';
import { useUIStore } from '@/stores/ui-store';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useUIStore((s) => s.showToast);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    selectedIds.forEach((id) => removeItem(id));
    setSelectedIds(new Set());
    showToast('선택한 상품이 삭제되었습니다', 'info');
  };

  const handleRemove = (productId: string) => {
    removeItem(productId);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    showToast('찜 목록에서 제거되었습니다', 'info');
  };

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      productName: item.productName,
      shopId: 'shop-default',
      shopName: '이우고 스토어',
      imageUrl: item.imageUrl,
      priceKrw: item.priceKrw,
      priceCny: item.priceCny,
      quantity: 10,
      minOrderQty: 10,
    });
    showToast('장바구니에 추가되었습니다', 'success');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
        <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 px-5 py-4">
          <h1 className="font-heading text-xl font-bold text-on-surface">찜 목록</h1>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-on-surface">찜 목록</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">{items.length}개 상품</p>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              삭제 ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center py-24 px-5">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-[48px]">favorite_border</span>
          </div>
          <h2 className="font-heading text-lg font-bold text-on-surface mb-2">찜한 상품이 없어요</h2>
          <p className="text-sm text-on-surface-variant text-center mb-6">마음에 드는 상품을 찜해보세요</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-container transition-all"
          >
            쇼핑하러 가기
          </Link>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft hover:shadow-medium transition-all"
            >
              <div className="flex gap-3 p-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleItem(item.productId)}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-1',
                    selectedIds.has(item.productId)
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant bg-transparent'
                  )}
                >
                  {selectedIds.has(item.productId) && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>

                {/* Image */}
                <Link href={`/product/${item.productId}`} className="w-24 h-24 rounded-xl bg-surface-container overflow-hidden shrink-0 relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-[36px]">image</span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-on-surface-variant font-medium">{item.category}</span>
                      <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight mt-0.5">
                        {item.productName}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="text-on-surface-variant/40 hover:text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-on-surface">
                        {item.priceKrw.toLocaleString()}원
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      ¥{item.priceCny.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="mt-2 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    장바구니 담기
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
