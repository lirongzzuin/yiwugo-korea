'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ExchangeRateBanner from '@/components/common/ExchangeRateBanner';
import ProductCard, { type Product } from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import { cn } from '@/lib/cn';

// Chinese category name → Korean mapping
const CATEGORY_NAME_MAP: Record<string, string> = {
  '饰品': '액세서리',
  '工艺品': '공예품',
  '五金': '철물',
  '箱包': '가방',
  '服装服饰': '패션의류',
  '日用百货': '생활잡화',
  '针纺织品': '섬유직물',
  '鞋类': '신발',
  '玩具': '완구',
  '文体': '문구/체육',
  '电子电器': '전자/가전',
  '化妆品': '화장품',
  '食品': '식품',
  '汽摩配件': '자동차부품',
  '母婴用品': '유아용품',
  '宠物用品': '반려동물',
  '运动户外': '스포츠/아웃도어',
  '家居家装': '홈인테리어',
  '办公文教': '사무/교육',
  '护肤品': '스킨케어',
};

// Material icon mapping for categories
const CATEGORY_ICON_MAP: Record<string, string> = {
  '饰品': 'diamond',
  '工艺品': 'palette',
  '五金': 'build',
  '箱包': 'luggage',
  '服装服饰': 'checkroom',
  '日用百货': 'kitchen',
  '针纺织品': 'texture',
  '鞋类': 'steps',
  '玩具': 'toys',
  '文体': 'edit',
  '电子电器': 'devices',
  '化妆品': 'spa',
  '食品': 'restaurant',
  '汽摩配件': 'directions_car',
  '母婴用品': 'child_care',
  '宠物用品': 'pets',
  '运动户外': 'sports_soccer',
  '家居家装': 'local_florist',
  '办公文教': 'school',
  '护肤品': 'face_retouching_natural',
};

interface ApiCategory {
  id: number;
  type: string;
  entype: string;
  img?: string;
  rank?: string;
}

const POPULAR_TABS = ['전체', '조명', '전자', '주방', '뷰티'] as const;

// --- Components ---

function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/popular?pageSize=5')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setBanners(data.data.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const next = useCallback(() => {
    setBanners((b) => {
      if (b.length === 0) return b;
      setCurrent((c) => (c + 1) % b.length);
      return b;
    });
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (loading) {
    return (
      <div className="aspect-[16/9] bg-surface-container rounded-2xl animate-pulse" />
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const gradients = [
    'from-primary to-primary-container',
    'from-tertiary to-tertiary-container',
    'from-secondary to-secondary-container',
  ];

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((product, idx) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="w-full flex-shrink-0"
            >
              <div
                className={cn(
                  'aspect-[16/9] bg-gradient-to-br rounded-2xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden',
                  gradients[idx % gradients.length]
                )}
              >
                {product.imageUrl && (
                  <div className="absolute inset-0 opacity-30">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="relative z-10 text-white">
                  <h2 className="text-xl md:text-3xl font-heading font-black mb-1 line-clamp-1">
                    {product.name}
                  </h2>
                  <p className="text-sm md:text-base text-white/80">
                    {product.priceKRW > 0
                      ? `${product.priceKRW.toLocaleString()}원 ~ 인기 도매 상품`
                      : '이우 인기 도매 상품'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === current
                ? 'w-6 bg-primary'
                : 'w-1.5 bg-stone-300'
            )}
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
        if (Array.isArray(data)) {
          setCategories(data.slice(0, 10));
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

  // If API categories loaded, show them; last slot is always "전체보기"
  const displayCategories = categories.slice(0, 9);

  return (
    <div className="grid grid-cols-5 gap-2 md:gap-3">
      {displayCategories.map((cat) => {
        const koreanName = CATEGORY_NAME_MAP[cat.type] || cat.type;
        const icon = CATEGORY_ICON_MAP[cat.type] || 'category';
        return (
          <Link
            key={cat.id}
            href={`/search?categoryId=${cat.id}`}
            className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl hover:bg-surface-container transition-colors"
          >
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px] md:text-[24px]">
                {icon}
              </span>
            </div>
            <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">
              {koreanName}
            </span>
          </Link>
        );
      })}
      <Link
        href="/category"
        className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl hover:bg-surface-container transition-colors"
      >
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[22px] md:text-[24px]">
            more_horiz
          </span>
        </div>
        <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">
          전체보기
        </span>
      </Link>
    </div>
  );
}

function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products/featured')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-on-surface">
          신상품
        </h2>
        <Link
          href="/search?sort=newest"
          className="text-xs text-on-surface-variant flex items-center gap-0.5 hover:text-primary transition-colors"
        >
          더보기
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('전체');

  useEffect(() => {
    fetch('/api/products/popular?pageSize=24')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts =
    activeTab === '전체'
      ? products
      : products.filter((p) => p.category === activeTab);

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

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-on-surface">
          인기 상품
        </h2>
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {POPULAR_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      <ProductGrid products={filteredProducts} columns={2} />
    </section>
  );
}

function TrustBanner() {
  return (
    <section className="bg-primary-container rounded-2xl p-5 md:p-8 text-white">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[28px]">
            local_shipping
          </span>
        </div>
        <div>
          <h3 className="font-heading font-bold text-base md:text-lg mb-1">
            전문 물류 서비스
          </h3>
          <p className="text-sm text-white/80 leading-relaxed">
            이우 현지 검수 &rarr; 합포장 &rarr; 한국 통관 &rarr; 국내 배송까지.
            전 과정 추적 가능한 원스톱 물류 시스템으로 안전하게 받아보세요.
          </p>
        </div>
      </div>
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
        <CategoryGrid />
        <NewArrivalsSection />
        <TrustBanner />
        <PopularPicksSection />
      </div>
    </>
  );
}
