'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ExchangeRateBanner from '@/components/common/ExchangeRateBanner';
import ProductCard, { type Product } from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import { useTranslatedProducts } from '@/hooks/useTranslation';
import { cn } from '@/lib/cn';

// Chinese category name → Korean mapping (matches actual API response)
const CATEGORY_NAME_MAP: Record<string, string> = {
  '辅料': '부자재', '配饰': '패션잡화', '医疗器械': '의료기기', '五金': '철물/공구',
  '机械': '기계', '鞋靴': '신발', '家电': '가전', '数码': '디지털',
  '汽车用品': '자동차용품', '百货': '생활잡화', '母婴': '유아/출산', '工艺品': '공예품',
  '个护': '개인위생', '帽子围巾': '모자/스카프', '节庆礼品': '축제/선물', '箱包': '가방',
  '宠物用品': '반려동물', '体育用品': '스포츠', '办公文教': '사무/문구', '服饰': '의류',
  '内衣': '속옷/언더웨어', '袜类': '양말', '厨卫': '주방/욕실', '饰品': '액세서리',
  '玩具': '완구', '地摊挑货': '시장용품', '美妆': '뷰티', '药品': '의약품',
};

const CATEGORY_ICON_MAP: Record<string, string> = {
  '辅料': 'content_cut', '配饰': 'watch', '医疗器械': 'medical_services', '五金': 'build',
  '机械': 'precision_manufacturing', '鞋靴': 'steps', '家电': 'kitchen', '数码': 'smartphone',
  '汽车用品': 'directions_car', '百货': 'storefront', '母婴': 'child_care', '工艺品': 'palette',
  '个护': 'face_retouching_natural', '帽子围巾': 'checkroom', '节庆礼品': 'celebration', '箱包': 'luggage',
  '宠物用品': 'pets', '体育用品': 'sports_soccer', '办公文教': 'school', '服饰': 'checkroom',
  '内衣': 'dry_cleaning', '袜类': 'footprint', '厨卫': 'countertops', '饰品': 'diamond',
  '玩具': 'toys', '地摊挑货': 'shopping_cart', '美妆': 'spa', '药品': 'medication',
};

// Fallback Korean promo banners (used when API has no popular products)
// Images: Unsplash (free for commercial use, no attribution required)
const FALLBACK_BANNERS = [
  {
    title: '이우 시장 200만개 상품',
    subtitle: '중국 최대 도매시장 이우에서 직소싱',
    gradient: 'from-primary to-primary-container',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop&q=80',
  },
  {
    title: '결제 기준 환율 실시간 적용',
    subtitle: '한국수출입은행 기준 CNY→KRW 자동 환산',
    gradient: 'from-tertiary to-tertiary-container',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop&q=80',
  },
  {
    title: '원스톱 물류 서비스',
    subtitle: '검수 → 합포장 → 통관 → 국내배송',
    gradient: 'from-secondary to-secondary-container',
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=450&fit=crop&q=80',
  },
];

interface ApiCategory {
  id: number;
  type: string;
  entype: string;
  img?: string;
}

const POPULAR_TABS = ['전체', '조명', '전자', '주방', '뷰티'] as const;

// --- Components ---

function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const translated = useTranslatedProducts(rawProducts);
  // Use translated names when ready, otherwise show raw products
  const products = translated.length > 0 ? translated : rawProducts;

  useEffect(() => {
    fetch('/api/products/popular?pageSize=5')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.length > 0) {
          setRawProducts(data.data.slice(0, 3));
        } else {
          return fetch('/api/products/search?pageSize=5')
            .then((r) => r.json())
            .then((d) => {
              if (d?.data?.length > 0) setRawProducts(d.data.slice(0, 3));
            });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bannerCount = rawProducts.length > 0 ? rawProducts.length : FALLBACK_BANNERS.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % bannerCount);
    }, 4000);
    return () => clearInterval(timer);
  }, [bannerCount]);

  if (loading) {
    return <div className="aspect-[16/9] bg-surface-container rounded-2xl animate-pulse" />;
  }

  const gradients = [
    'from-primary to-primary-container',
    'from-tertiary to-tertiary-container',
    'from-secondary to-secondary-container',
  ];

  const hasBannerProducts = rawProducts.length > 0;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {hasBannerProducts
            ? products.map((product, idx) => (
                <Link key={product.id} href={`/product/${product.id}`} className="w-full flex-shrink-0">
                  <div className={cn('aspect-[16/9] bg-gradient-to-br rounded-2xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden', gradients[idx % 3])}>
                    {product.imageUrl && (
                      <div className="absolute inset-0 opacity-30">
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="relative z-10 text-white">
                      <h2 className="text-xl md:text-3xl font-heading font-black mb-1 line-clamp-1">{product.name}</h2>
                      <p className="text-sm md:text-base text-white/80">
                        {product.priceKRW > 0 ? `${product.priceKRW.toLocaleString()}원 ~ 인기 도매 상품` : '이우 인기 도매 상품'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            : FALLBACK_BANNERS.map((banner, idx) => (
                <Link key={idx} href="/search" className="w-full flex-shrink-0">
                  <div className={cn('aspect-[16/9] bg-gradient-to-br rounded-2xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden', banner.gradient)}>
                    {banner.imageUrl && (
                      <div className="absolute inset-0 opacity-25">
                        <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" loading={idx === 0 ? 'eager' : 'lazy'} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="relative z-10 text-white">
                      <h2 className="text-xl md:text-3xl font-heading font-black mb-1">{banner.title}</h2>
                      <p className="text-sm md:text-base text-white/80">{banner.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {Array.from({ length: bannerCount }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn('h-1.5 rounded-full transition-all', i === current ? 'w-6 bg-primary' : 'w-1.5 bg-stone-300')}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryGrid() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 p-2 md:p-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-surface-container animate-pulse" />
            <div className="w-10 h-3 bg-surface-container rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Sort by popularity (most products) — hardcoded priority based on Yiwugo market data
  const PRIORITY_ORDER = ['服饰', '饰品', '百货', '箱包', '鞋靴', '玩具', '五金', '美妆', '家电', '体育用品', '数码', '厨卫', '工艺品', '办公文教', '母婴', '宠物用品', '配饰', '内衣', '袜类'];
  const sorted = [...categories].sort((a, b) => {
    const ia = PRIORITY_ORDER.indexOf(a.type);
    const ib = PRIORITY_ORDER.indexOf(b.type);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });
  const displayCategories = sorted.slice(0, 9);

  // If API returned nothing, show nothing (don't block the page)
  if (displayCategories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-5 gap-2 md:gap-3">
      {displayCategories.map((cat) => {
        const koreanName = CATEGORY_NAME_MAP[cat.type] || cat.type;
        const icon = CATEGORY_ICON_MAP[cat.type] || 'category';
        return (
          <Link
            key={cat.id}
            href={`/category/${encodeURIComponent(cat.type)}`}
            className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl hover:bg-surface-container transition-colors"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px] md:text-[24px]">{icon}</span>
            </div>
            <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">{koreanName}</span>
          </Link>
        );
      })}
      <Link
        href="/category"
        className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl hover:bg-surface-container transition-colors"
      >
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[22px] md:text-[24px]">more_horiz</span>
        </div>
        <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">전체보기</span>
      </Link>
    </div>
  );
}

function NewArrivalsSection() {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);
  const translated = useTranslatedProducts(rawProducts);
  const products = translated.length > 0 ? translated : rawProducts;

  useEffect(() => {
    setLoading(true);
    fetch('/api/products/featured')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.length > 0) {
          setRawProducts(data.data);
        } else {
          return fetch('/api/products/search?pageSize=12')
            .then((r) => r.json())
            .then((d) => { if (d?.data?.length > 0) setRawProducts(d.data); });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchKey]);

  // Re-fetch when navigating back and products are empty
  useEffect(() => {
    if (!loading && rawProducts.length === 0) {
      setFetchKey((k) => k + 1);
    }
  }, [loading, rawProducts.length]);

  if (loading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-heading font-bold text-on-surface">신상품</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[150px] md:w-[180px] h-[240px] bg-surface-container rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-on-surface">신상품</h2>
        <Link href="/search?sort=newest" className="text-xs text-on-surface-variant flex items-center gap-0.5 hover:text-primary transition-colors">
          더보기
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[150px] md:w-[180px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularPicksSection() {
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('전체');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);
  const translated = useTranslatedProducts(rawProducts);
  const products = translated.length > 0 ? translated : rawProducts;
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const size = 24;
      let url = `/api/products/popular?pageSize=${size}&page=${pageNum}`;
      const res = await fetch(url);
      const data = await res.json();
      let items = data?.data || [];

      // Fallback to search if popular returns empty
      if (items.length === 0 && pageNum === 1) {
        const res2 = await fetch(`/api/products/search?pageSize=${size}&page=${pageNum}`);
        const data2 = await res2.json();
        items = data2?.data || [];
      }

      if (append) {
        // 중복 상품 제거
        setRawProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newItems = items.filter((p: Product) => !existingIds.has(p.id));
          if (newItems.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newItems];
        });
      } else {
        setRawProducts(items);
      }
      setHasMore(items.length >= size);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage, fetchKey]);

  useEffect(() => {
    if (!loading && rawProducts.length === 0) setFetchKey((k) => k + 1);
  }, [loading, rawProducts.length]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchPage(next, true);
  }, [page, loadingMore, hasMore, fetchPage]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) loadMore(); },
      { rootMargin: '400px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  const filteredProducts = activeTab === '전체' ? products : products.filter((p) => p.category === activeTab);

  if (loading) {
    return (
      <section>
        <h2 className="text-lg font-heading font-bold text-on-surface mb-4">인기 상품</h2>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] bg-surface-container rounded-xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-on-surface">인기 상품</h2>
        <Link href="/search?sort=sales" className="text-xs text-on-surface-variant flex items-center gap-0.5 hover:text-primary transition-colors">
          전체보기
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </Link>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {POPULAR_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <ProductGrid products={filteredProducts} columns={2} />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />
      {loadingMore && (
        <div className="flex items-center justify-center py-6 gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-on-surface-variant">상품을 불러오는 중...</span>
        </div>
      )}
      {!hasMore && products.length > 20 && (
        <div className="text-center py-6">
          <p className="text-xs text-on-surface-variant/60">{products.length}개 상품을 모두 불러왔습니다</p>
        </div>
      )}
    </section>
  );
}

function TrustBanner() {
  const features = [
    { icon: 'verified', label: '정품 보장', desc: '이우 현지 직소싱', color: 'text-blue-600 bg-blue-50' },
    { icon: 'local_shipping', label: '원스톱 물류', desc: '검수→통관→배송', color: 'text-emerald-600 bg-emerald-50' },
    { icon: 'currency_exchange', label: '실시간 환율', desc: 'CNY→KRW 자동', color: 'text-amber-600 bg-amber-50' },
    { icon: 'support_agent', label: '한국어 지원', desc: '전담 고객센터', color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {features.map((f) => (
        <div key={f.label} className={cn('flex items-center gap-3 p-3.5 rounded-xl', f.color.split(' ')[1])}>
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', f.color.split(' ')[1])}>
            <span className={cn('material-symbols-outlined text-[22px]', f.color.split(' ')[0])}>{f.icon}</span>
          </div>
          <div>
            <p className={cn('text-xs font-bold', f.color.split(' ')[0])}>{f.label}</p>
            <p className="text-[10px] text-on-surface-variant">{f.desc}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

// --- Page ---

export default function HomePage() {
  return (
    <>
      <ExchangeRateBanner />
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-5 space-y-8">
        <PromoBannerCarousel />
        <TrustBanner />
        <CategoryGrid />
        <NewArrivalsSection />
        {/* Personalized recommendations */}
        <RecommendedProducts
          type="personalized"
          limit={12}
          title="맞춤 추천 상품"
        />
        <PopularPicksSection />
      </div>
    </>
  );
}
