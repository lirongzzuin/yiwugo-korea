'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

interface WishlistItem {
  id: string;
  name: string;
  category: string;
  priceKRW: number;
  originalPriceKRW?: number;
  priceCNY: number;
  badge?: 'price-drop' | 'low-stock' | null;
  image: string;
}

const MOCK_ITEMS: WishlistItem[] = [
  {
    id: '1',
    name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터 맥북 프로 호환',
    category: '전자/디지털',
    priceKRW: 15900,
    originalPriceKRW: 18900,
    priceCNY: 83,
    badge: 'price-drop',
    image: '',
  },
  {
    id: '2',
    name: '무선 블루투스 이어버드 TWS 5.3 노이즈캔슬링',
    category: '전자/디지털',
    priceKRW: 8500,
    priceCNY: 45,
    badge: 'low-stock',
    image: '',
  },
  {
    id: '3',
    name: '여성 캐주얼 니트 가디건 오버핏 봄 가을',
    category: '패션/의류',
    priceKRW: 12400,
    priceCNY: 65,
    badge: null,
    image: '',
  },
  {
    id: '4',
    name: '실리콘 주방용품 세트 12종 내열 조리도구',
    category: '생활/주방',
    priceKRW: 6300,
    originalPriceKRW: 7800,
    priceCNY: 33,
    badge: 'price-drop',
    image: '',
  },
  {
    id: '5',
    name: 'LED 스마트 데스크 램프 무선충전 3in1',
    category: '전자/디지털',
    priceKRW: 24500,
    priceCNY: 128,
    badge: null,
    image: '',
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = () => {
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)));
    setSelectedIds(new Set());
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-xl font-bold text-on-surface">Your Wishlist</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">{items.length} items saved</p>
          </div>
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-error/10 text-error text-sm font-semibold hover:bg-error/20 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Bulk Delete ({selectedIds.size})
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
              key={item.id}
              className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft hover:shadow-medium transition-all"
            >
              <div className="flex gap-3 p-4">
                {/* Checkbox */}
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 mt-1',
                    selectedIds.has(item.id)
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant bg-transparent'
                  )}
                >
                  {selectedIds.has(item.id) && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>

                {/* Image */}
                <div className="w-24 h-24 rounded-xl bg-surface-container flex items-center justify-center shrink-0 relative">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-[36px]">image</span>
                  {/* Badges */}
                  {item.badge && (
                    <div className={cn(
                      'absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold',
                      item.badge === 'price-drop' && 'bg-green-500 text-white',
                      item.badge === 'low-stock' && 'bg-orange-500 text-white',
                    )}>
                      {item.badge === 'price-drop' ? 'PRICE DROP' : 'LOW STOCK'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] text-on-surface-variant font-medium">{item.category}</span>
                      <h3 className="text-sm font-medium text-on-surface line-clamp-2 leading-tight mt-0.5">
                        {item.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-on-surface-variant/40 hover:text-error transition-colors shrink-0"
                    >
                      <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-on-surface">
                        {item.priceKRW.toLocaleString()}원
                      </span>
                      {item.originalPriceKRW && (
                        <span className="text-xs text-on-surface-variant line-through">
                          {item.originalPriceKRW.toLocaleString()}원
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      ¥{item.priceCNY.toLocaleString()}
                    </span>
                  </div>

                  <button className="mt-2 w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                    Add to Cart
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
