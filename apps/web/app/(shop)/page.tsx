'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ExchangeRateBanner from '@/components/common/ExchangeRateBanner';
import ProductCard, { type Product } from '@/components/product/ProductCard';
import ProductGrid from '@/components/product/ProductGrid';
import { cn } from '@/lib/cn';

// --- Mock Data ---
const PROMO_BANNERS = [
  {
    id: '1',
    title: '봄맞이 생활용품 특가전',
    subtitle: '최대 60% 할인 + 무료배송',
    gradient: 'from-primary to-primary-container',
    link: '/category/living',
  },
  {
    id: '2',
    title: '디지털 액세서리 대전',
    subtitle: '인기 전자제품 MOQ 50개부터',
    gradient: 'from-tertiary to-tertiary-container',
    link: '/category/digital',
  },
  {
    id: '3',
    title: '여름 패션 사전예약',
    subtitle: '트렌디한 의류 소싱 찬스',
    gradient: 'from-secondary to-secondary-container',
    link: '/category/fashion',
  },
];

const CATEGORIES = [
  { icon: 'kitchen', label: '생활/주방', slug: 'living' },
  { icon: 'checkroom', label: '패션/의류', slug: 'fashion' },
  { icon: 'devices', label: '전자/디지털', slug: 'digital' },
  { icon: 'spa', label: '뷰티/건강', slug: 'beauty' },
  { icon: 'toys', label: '문구/완구', slug: 'stationery' },
  { icon: 'sports_soccer', label: '스포츠', slug: 'sports' },
  { icon: 'pets', label: '반려동물', slug: 'pets' },
  { icon: 'build', label: '공구/산업', slug: 'tools' },
  { icon: 'local_florist', label: '인테리어', slug: 'interior' },
  { icon: 'more_horiz', label: '전체보기', slug: 'all' },
];

const POPULAR_TABS = ['전체', '리빙/주방', '디지털', '스포츠'] as const;

function generateMockProduct(id: number, badge?: Product['badge']): Product {
  const names = [
    'LED 무드등 감성 조명 인테리어 램프',
    '실리콘 주방용품 세트 논슬립 조리도구',
    'USB-C 멀티 허브 7in1 HDMI 어댑터',
    '스테인리스 텀블러 500ml 보온보냉',
    '무선 블루투스 이어폰 노이즈캔슬링',
    '접이식 캠핑 테이블 경량 알루미늄',
    '다이캐스팅 냄비 세트 IH 인덕션 호환',
    '에코백 캔버스 장바구니 대용량',
    '스마트워치 밴드 실리콘 교체용',
    '미니 가습기 USB 초음파 무소음',
    '요가 매트 TPE 6mm 미끄럼방지',
    'LED 스탠드 조명 터치 밝기조절',
    '자동차 핸드폰 거치대 에어컨 송풍구',
    '폴딩 우산 자동 3단 방풍 우산',
    '실리콘 주방장갑 내열 오븐장갑',
    '미니 선풍기 USB 탁상용 저소음',
  ];
  const categories = ['리빙/주방', '디지털', '스포츠', '패션', '뷰티'];
  const priceKRW = Math.floor(Math.random() * 50000) + 2000;
  const priceCNY = Math.floor(priceKRW / 190);
  return {
    id: `prod-${id}`,
    name: names[id % names.length],
    imageUrl: `https://picsum.photos/seed/yiwu${id}/400/400`,
    category: categories[id % categories.length],
    priceKRW,
    originalPriceKRW: badge === 'SALE' ? Math.floor(priceKRW * 1.3) : undefined,
    priceCNY,
    discountPercent: badge === 'SALE' ? 30 : undefined,
    moq: [10, 20, 50, 100][id % 4],
    salesCount: Math.floor(Math.random() * 5000),
    badge: badge || null,
  };
}

const NEW_ARRIVALS: Product[] = Array.from({ length: 10 }, (_, i) =>
  generateMockProduct(i + 100, i < 2 ? 'NEW' : null)
);

const POPULAR_PRODUCTS: Product[] = Array.from({ length: 12 }, (_, i) =>
  generateMockProduct(i + 200, i === 0 ? 'TOP' : i === 3 ? 'HOT' : i === 5 ? 'SALE' : null)
);

// --- Components ---

function PromoBannerCarousel() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % PROMO_BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {PROMO_BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.link}
              className="w-full flex-shrink-0"
            >
              <div
                className={cn(
                  'aspect-[16/9] bg-gradient-to-br rounded-2xl p-6 md:p-10 flex flex-col justify-end relative overflow-hidden',
                  banner.gradient
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <div className="relative z-10 text-white">
                  <h2 className="text-xl md:text-3xl font-heading font-black mb-1">
                    {banner.title}
                  </h2>
                  <p className="text-sm md:text-base text-white/80">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {PROMO_BANNERS.map((_, i) => (
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
  return (
    <div className="grid grid-cols-5 gap-2 md:gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="flex flex-col items-center gap-1.5 p-2 md:p-3 rounded-xl hover:bg-surface-container transition-colors"
        >
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-primary/5 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px] md:text-[24px]">
              {cat.icon}
            </span>
          </div>
          <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">
            {cat.label}
          </span>
        </Link>
      ))}
    </div>
  );
}

function NewArrivalsSection() {
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
        {NEW_ARRIVALS.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-[150px] md:w-[180px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PopularPicksSection() {
  const [activeTab, setActiveTab] = useState<string>('전체');

  const filteredProducts =
    activeTab === '전체'
      ? POPULAR_PRODUCTS
      : POPULAR_PRODUCTS.filter((p) => p.category === activeTab);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-bold text-on-surface">
          인기 상품
        </h2>
      </div>
      {/* Tabs */}
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
