'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';
import { cn } from '@/lib/cn';

// --- Mock Data ---
function generateSearchResults(query: string): Product[] {
  return Array.from({ length: 24 }, (_, i) => {
    const priceKRW = Math.floor(Math.random() * 80000) + 1500;
    const badges: Array<Product['badge']> = [null, 'TOP', 'SALE', 'HOT', null, null, 'NEW', null];
    return {
      id: `search-${i}`,
      name: `${query || '상품'} ${['LED 조명', '무선 충전기', '실리콘 케이스', '스마트 소켓', '센서 모듈', '리모컨', '디밍 컨트롤러', '방수 스트립'][i % 8]} ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/search${i}/400/400`,
      category: ['리빙/주방', '디지털', '스포츠', '패션'][i % 4],
      priceKRW,
      originalPriceKRW: i % 3 === 0 ? Math.floor(priceKRW * 1.25) : undefined,
      priceCNY: Math.floor(priceKRW / 190),
      discountPercent: i % 3 === 0 ? 20 : undefined,
      moq: [5, 10, 20, 50, 100][i % 5],
      salesCount: Math.floor(Math.random() * 8000),
      badge: badges[i % badges.length],
    };
  });
}

type SortKey = 'relevance' | 'price_asc' | 'price_desc' | 'sales' | 'newest';
type PriceRange = 'all' | 'under5k' | '5k-20k' | '20k-50k' | 'over50k';
type MoqRange = 'all' | 'under10' | '10-50' | '50-100' | 'over100';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'relevance', label: '관련도순' },
  { key: 'price_asc', label: '가격 낮은순' },
  { key: 'price_desc', label: '가격 높은순' },
  { key: 'sales', label: '판매량순' },
  { key: 'newest', label: '최신순' },
];

const PRICE_RANGES: { key: PriceRange; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under5k', label: '~5,000원' },
  { key: '5k-20k', label: '5,000~20,000원' },
  { key: '20k-50k', label: '20,000~50,000원' },
  { key: 'over50k', label: '50,000원~' },
];

const MOQ_RANGES: { key: MoqRange; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'under10', label: '10개 이하' },
  { key: '10-50', label: '10~50개' },
  { key: '50-100', label: '50~100개' },
  { key: 'over100', label: '100개 이상' },
];

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 lg:px-8 py-4"><div className="animate-pulse h-96 bg-surface-container rounded-xl" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [sort, setSort] = useState<SortKey>('relevance');
  const [priceRange, setPriceRange] = useState<PriceRange>('all');
  const [moqRange, setMoqRange] = useState<MoqRange>('all');
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [displayCount, setDisplayCount] = useState(12);

  const allProducts = useMemo(() => generateSearchResults(query), [query]);

  const filteredProducts = useMemo(() => {
    let products = [...allProducts];

    // Price filter
    if (priceRange !== 'all') {
      products = products.filter((p) => {
        switch (priceRange) {
          case 'under5k': return p.priceKRW < 5000;
          case '5k-20k': return p.priceKRW >= 5000 && p.priceKRW < 20000;
          case '20k-50k': return p.priceKRW >= 20000 && p.priceKRW < 50000;
          case 'over50k': return p.priceKRW >= 50000;
          default: return true;
        }
      });
    }

    // MOQ filter
    if (moqRange !== 'all') {
      products = products.filter((p) => {
        const moq = p.moq || 0;
        switch (moqRange) {
          case 'under10': return moq <= 10;
          case '10-50': return moq > 10 && moq <= 50;
          case '50-100': return moq > 50 && moq <= 100;
          case 'over100': return moq > 100;
          default: return true;
        }
      });
    }

    // Sort
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.priceKRW - b.priceKRW);
        break;
      case 'price_desc':
        products.sort((a, b) => b.priceKRW - a.priceKRW);
        break;
      case 'sales':
        products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        break;
      default:
        break;
    }

    return products;
  }, [allProducts, priceRange, moqRange, sort]);

  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = displayCount < filteredProducts.length;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      {/* Search result header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-heading font-bold text-on-surface">
          {query ? (
            <>
              <span className="text-primary">{query}</span>{' '}
              <span className="text-on-surface-variant font-normal">
                {filteredProducts.length.toLocaleString()}개
              </span>
            </>
          ) : (
            '전체 상품'
          )}
        </h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors md:hidden"
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          필터
        </button>
      </div>

      {/* Sort chips - always visible */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSort(opt.key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors',
              sort === opt.key
                ? 'bg-primary text-white border-primary'
                : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:border-primary/50'
            )}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={() => setCertifiedOnly(!certifiedOnly)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex items-center gap-1',
            certifiedOnly
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:border-primary/50'
          )}
        >
          <span className="material-symbols-outlined text-[14px]">verified</span>
          인증상점
        </button>
        <button
          onClick={() => setFreeShipping(!freeShipping)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-colors flex items-center gap-1',
            freeShipping
              ? 'bg-primary text-white border-primary'
              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:border-primary/50'
          )}
        >
          <span className="material-symbols-outlined text-[14px]">local_shipping</span>
          무료배송
        </button>
      </div>

      {/* Expanded filter panel */}
      {showFilters && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 mb-4 animate-slide-down space-y-4 md:hidden">
          {/* Price range */}
          <div>
            <h3 className="text-xs font-semibold text-on-surface mb-2">가격대</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setPriceRange(r.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    priceRange === r.key
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-surface-container-low text-on-surface-variant border-transparent'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {/* MOQ */}
          <div>
            <h3 className="text-xs font-semibold text-on-surface mb-2">최소 주문수량</h3>
            <div className="flex flex-wrap gap-2">
              {MOQ_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setMoqRange(r.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    moqRange === r.key
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-surface-container-low text-on-surface-variant border-transparent'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar + grid layout */}
      <div className="flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden md:block w-52 flex-shrink-0 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-3">가격대</h3>
            <div className="space-y-1.5">
              {PRICE_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setPriceRange(r.key)}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    priceRange === r.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-3">최소 주문수량</h3>
            <div className="space-y-1.5">
              {MOQ_RANGES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setMoqRange(r.key)}
                  className={cn(
                    'block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                    moqRange === r.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <ProductGrid products={displayedProducts} columns={2} />

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setDisplayCount((c) => c + 12)}
                className="px-8 py-2.5 rounded-full border border-outline-variant/50 text-sm font-medium text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
              >
                더보기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
