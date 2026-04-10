'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface CartItem {
  id: string;
  name: string;
  option: string;
  priceKRW: number;
  priceCNY: number;
  quantity: number;
  image: string;
  shopId: string;
}

interface Shop {
  id: string;
  name: string;
  items: CartItem[];
  shippingEstimate: string;
}

const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop1',
    name: '광저우 디지털 마트',
    shippingEstimate: '예상 배송비 ¥28 (~₩5,400)',
    items: [
      {
        id: '1',
        name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터',
        option: '색상: 실버 / 모델: 7포트',
        priceKRW: 18900,
        priceCNY: 99,
        quantity: 10,
        image: '/placeholder-product.png',
        shopId: 'shop1',
      },
      {
        id: '2',
        name: '무선 블루투스 이어버드 TWS 5.3',
        option: '색상: 화이트',
        priceKRW: 8500,
        priceCNY: 45,
        quantity: 20,
        image: '/placeholder-product.png',
        shopId: 'shop1',
      },
    ],
  },
  {
    id: 'shop2',
    name: '이우 패션 센터',
    shippingEstimate: '예상 배송비 ¥45 (~₩8,700)',
    items: [
      {
        id: '3',
        name: '여성 캐주얼 니트 가디건 오버핏',
        option: '색상: 베이지 / 사이즈: Free',
        priceKRW: 12400,
        priceCNY: 65,
        quantity: 5,
        image: '/placeholder-product.png',
        shopId: 'shop2',
      },
    ],
  },
];

export default function CartPage() {
  const [shops, setShops] = useState(MOCK_SHOPS);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(MOCK_SHOPS.flatMap((s) => s.items.map((i) => i.id)))
  );

  const allItems = shops.flatMap((s) => s.items);
  const allSelected = allItems.length > 0 && allItems.every((item) => selectedItems.has(item.id));
  const selectedCount = allItems.filter((item) => selectedItems.has(item.id)).length;

  const toggleItem = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShop = (shopId: string) => {
    const shop = shops.find((s) => s.id === shopId);
    if (!shop) return;
    const shopItemIds = shop.items.map((i) => i.id);
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
      setSelectedItems(new Set(allItems.map((i) => i.id)));
    }
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setShops((prev) =>
      prev.map((shop) => ({
        ...shop,
        items: shop.items.map((item) =>
          item.id === itemId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        ),
      }))
    );
  };

  const removeItem = (itemId: string) => {
    setShops((prev) =>
      prev
        .map((shop) => ({
          ...shop,
          items: shop.items.filter((item) => item.id !== itemId),
        }))
        .filter((shop) => shop.items.length > 0)
    );
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const totalKRW = allItems
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceKRW * item.quantity, 0);

  const totalCNY = allItems
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.priceCNY * item.quantity, 0);

  const isEmpty = allItems.length === 0;

  return (
    <div className="min-h-screen bg-surface max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md px-5 py-3 border-b border-outline-variant/30">
        <h1 className="font-heading text-xl font-bold">
          Cart
          {!isEmpty && (
            <span className="text-on-surface-variant font-normal text-base ml-2">
              ({allItems.length})
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
            {shops.map((shop) => {
              const shopItemIds = shop.items.map((i) => i.id);
              const allShopSelected = shopItemIds.every((id) => selectedItems.has(id));

              return (
                <div key={shop.id} className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft">
                  {/* Shop header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">
                    <button
                      onClick={() => toggleShop(shop.id)}
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
                    <span className="text-sm font-semibold text-on-surface">{shop.name}</span>
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[18px] ml-auto">
                      chevron_right
                    </span>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-outline-variant/20">
                    {shop.items.map((item) => (
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
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-on-surface-variant/30 text-[32px]">
                              image
                            </span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight">
                              {item.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-on-surface-variant/50 hover:text-error transition-colors shrink-0"
                            >
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </div>
                          <p className="text-xs text-on-surface-variant mt-1">{item.option}</p>

                          <div className="flex items-end justify-between mt-2">
                            <div>
                              <p className="text-sm font-bold text-on-surface">
                                {(item.priceKRW * item.quantity).toLocaleString()}원
                              </p>
                              <p className="text-xs text-on-surface-variant">
                                ¥{(item.priceCNY * item.quantity).toLocaleString()}
                              </p>
                            </div>

                            {/* Quantity stepper */}
                            <div className="flex items-center gap-0 border border-outline-variant/40 rounded-lg overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-surface-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-[18px]">remove</span>
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
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

                  {/* Shipping estimate */}
                  <div className="px-4 py-2.5 bg-surface-container-low border-t border-outline-variant/20">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">local_shipping</span>
                      <span className="text-xs text-on-surface-variant">{shop.shippingEstimate}</span>
                    </div>
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
                Checkout ({selectedCount})
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
