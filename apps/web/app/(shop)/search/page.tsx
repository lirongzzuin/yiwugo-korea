'use client';

import { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';
import { useTranslatedProducts } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';
import { savePageState, loadPageState, restoreScrollPosition } from '@/lib/page-cache';

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

const SORT_MAP: Record<SortKey, string> = {
  relevance: '',
  price_asc: 'priceAsc',
  price_desc: 'priceDesc',
  sales: 'popular',
  newest: 'newest',
};

const PAGE_SIZE = 24;

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 lg:px-8 py-4"><div className="animate-pulse h-96 bg-surface-container rounded-xl" /></div>}>
      <SearchPageContent />
    </Suspense>
  );
}

interface SearchCacheState {
  rawProducts: Product[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  sort: SortKey;
  priceRange: PriceRange;
  moqRange: MoqRange;
  certifiedOnly: boolean;
  freeShipping: boolean;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('categoryId') || '';
  const cacheKey = `search:${query}:${categoryId}`;

  // 캐시에서 초기 상태 복원
  const cachedRef = useRef<SearchCacheState | null>(null);
  if (cachedRef.current === null && typeof window !== 'undefined') {
    const cached = loadPageState<SearchCacheState>(cacheKey);
    if (cached) cachedRef.current = cached.data;
  }

  const [sort, setSort] = useState<SortKey>(cachedRef.current?.sort || 'relevance');
  const [priceRange, setPriceRange] = useState<PriceRange>(cachedRef.current?.priceRange || 'all');
  const [moqRange, setMoqRange] = useState<MoqRange>(cachedRef.current?.moqRange || 'all');
  const [certifiedOnly, setCertifiedOnly] = useState(cachedRef.current?.certifiedOnly || false);
  const [freeShipping, setFreeShipping] = useState(cachedRef.current?.freeShipping || false);
  const [showFilters, setShowFilters] = useState(false);

  const [rawProducts, setRawProducts] = useState<Product[]>(cachedRef.current?.rawProducts || []);
  const [totalCount, setTotalCount] = useState(cachedRef.current?.totalCount || 0);
  const [loading, setLoading] = useState(cachedRef.current?.rawProducts ? false : true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(cachedRef.current?.page || 1);
  const [hasMore, setHasMore] = useState(cachedRef.current?.hasMore ?? true);
  const [restoredFromCache, setRestoredFromCache] = useState(!!cachedRef.current);
  const products = useTranslatedProducts(rawProducts);

  // Infinite scroll sentinel ref
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial fetch
  const fetchProducts = useCallback(async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (categoryId) params.set('categoryId', categoryId);
      params.set('page', String(pageNum));
      params.set('pageSize', String(PAGE_SIZE));
      if (SORT_MAP[sort]) params.set('sortBy', SORT_MAP[sort]);

      const res = await fetch(`/api/products/search?${params}`);
      const data = await res.json();

      if (data?.data && Array.isArray(data.data)) {
        if (append) {
          setRawProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newItems = data.data.filter((p: Product) => !existingIds.has(p.id));
            if (newItems.length === 0) {
              setHasMore(false);
              return prev;
            }
            return [...prev, ...newItems];
          });
        } else {
          setRawProducts(data.data);
        }
        setTotalCount(data.total || data.data.length);
        setHasMore(data.data.length >= PAGE_SIZE);
      } else {
        if (!append) setRawProducts([]);
        setHasMore(false);
      }
    } catch {
      if (!append) setRawProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, categoryId, sort]);

  // Reset and fetch when query/sort changes
  useEffect(() => {
    // 캐시 복원된 경우 첫 렌더에서는 fetch 건너뛰고 스크롤만 복원
    if (restoredFromCache) {
      setRestoredFromCache(false);
      const cached = loadPageState<SearchCacheState>(cacheKey);
      if (cached) {
        restoreScrollPosition(cached.scrollY);
      }
      return;
    }
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [fetchProducts, cacheKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // 상품 클릭 등으로 페이지 이탈 시 상태 저장
  useEffect(() => {
    if (loading || rawProducts.length === 0) return;
    const handleSave = () => {
      savePageState<SearchCacheState>(cacheKey, {
        rawProducts,
        totalCount,
        page,
        hasMore,
        sort,
        priceRange,
        moqRange,
        certifiedOnly,
        freeShipping,
      });
    };

    // 페이지 이탈 감지
    window.addEventListener('beforeunload', handleSave);
    // Link 클릭으로 이동 시를 대비해 주기적으로 저장
    const interval = setInterval(handleSave, 2000);

    return () => {
      handleSave();
      window.removeEventListener('beforeunload', handleSave);
      clearInterval(interval);
    };
  }, [cacheKey, rawProducts, totalCount, page, hasMore, sort, priceRange, moqRange, certifiedOnly, freeShipping, loading]);

  // Load more function
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  }, [page, loadingMore, hasMore, fetchProducts]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    if (priceRange !== 'all') {
      result = result.filter((p) => {
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
      result = result.filter((p) => {
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

    // Certified shop filter
    if (certifiedOnly) {
      result = result.filter((p) => (p.salesCount || 0) >= 100);
    }

    // Free shipping filter
    if (freeShipping) {
      result = result.filter((p) => p.priceKRW >= 10000);
    }

    // Client-side sort
    if (sort === 'price_asc') result.sort((a, b) => a.priceKRW - b.priceKRW);
    if (sort === 'price_desc') result.sort((a, b) => b.priceKRW - a.priceKRW);
    if (sort === 'sales') result.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));

    return result;
  }, [products, priceRange, moqRange, sort, certifiedOnly, freeShipping]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4">
      {/* Search result header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-base font-heading font-bold text-on-surface">
          {query ? (
            <>
              <span className="text-primary">&lsquo;{query}&rsquo;</span>{' '}
              <span className="text-on-surface-variant font-normal">
                {totalCount > 0 ? `${totalCount.toLocaleString()}개` : ''}
              </span>
            </>
          ) : (
            <>
              전체 상품
              {totalCount > 0 && (
                <span className="text-on-surface-variant font-normal ml-2">
                  {totalCount.toLocaleString()}개
                </span>
              )}
            </>
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

      {/* Sort chips */}
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

      {/* Expanded filter panel (mobile) */}
      {showFilters && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 mb-4 animate-slide-down space-y-4 md:hidden">
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
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-surface-container rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-[56px] text-on-surface-variant/30">search_off</span>
              <p className="text-on-surface font-medium mt-4">
                {query ? `'${query}'에 대한 검색 결과가 없습니다` : '조건에 맞는 상품이 없습니다'}
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                {priceRange !== 'all' || moqRange !== 'all'
                  ? '필터 조건을 변경해 보세요'
                  : '다른 키워드로 검색해 보세요'}
              </p>
              {(priceRange !== 'all' || moqRange !== 'all') && (
                <button
                  onClick={() => { setPriceRange('all'); setMoqRange('all'); setCertifiedOnly(false); setFreeShipping(false); }}
                  className="mt-4 px-5 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-container transition-colors"
                >
                  필터 초기화
                </button>
              )}
              {query && (
                <div className="mt-6">
                  <p className="text-xs text-on-surface-variant mb-3">이런 키워드는 어떠세요?</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['USB', '이어폰', 'LED', '케이스', '충전기', '수납'].map((kw) => (
                      <Link
                        key={kw}
                        href={`/search?q=${kw}`}
                        className="px-3 py-1.5 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {kw}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <ProductGrid products={filteredProducts} columns={2} />

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />

              {/* Loading more indicator */}
              {loadingMore && (
                <div className="flex items-center justify-center py-8 gap-2">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span className="text-sm text-on-surface-variant">상품을 불러오는 중...</span>
                </div>
              )}

              {/* End of results */}
              {!hasMore && filteredProducts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-xs text-on-surface-variant/60">
                    {filteredProducts.length.toLocaleString()}개 상품을 모두 불러왔습니다
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
