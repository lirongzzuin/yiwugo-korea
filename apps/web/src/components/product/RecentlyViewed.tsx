'use client';

import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { useRecentStore, type RecentProduct } from '@/stores/recent-store';

interface RecentlyViewedProps {
  excludeId?: string;
  maxItems?: number;
  className?: string;
}

export default function RecentlyViewed({ excludeId, maxItems = 10, className }: RecentlyViewedProps) {
  const items = useRecentStore((s: any) => s.items) as RecentProduct[];
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  const filtered = items
    .filter((p) => p.id !== excludeId)
    .slice(0, maxItems);

  if (filtered.length === 0) return null;

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-heading font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">history</span>
          최근 본 상품
        </h2>
        <span className="text-[10px] text-on-surface-variant">{filtered.length}개</span>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {filtered.map((item) => (
          <div key={item.id} className="w-[140px] md:w-[160px] shrink-0">
            <ProductCard
              product={{
                id: item.id,
                name: item.name,
                imageUrl: item.imageUrl,
                priceKRW: item.priceKRW,
                priceCNY: item.priceCNY,
                category: item.category,
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
