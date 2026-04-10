'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';
import { DETAILED_PRODUCTS } from '@/lib/mock-data';

// --- Mock Data ---
const MAIN_CATEGORIES = [
  { slug: 'living', label: '생활/주방', icon: 'kitchen' },
  { slug: 'fashion', label: '패션/의류', icon: 'checkroom' },
  { slug: 'digital', label: '전자/디지털', icon: 'devices' },
  { slug: 'beauty', label: '뷰티/건강', icon: 'spa' },
  { slug: 'stationery', label: '문구/완구', icon: 'toys' },
  { slug: 'sports', label: '스포츠', icon: 'sports_soccer' },
  { slug: 'pets', label: '반려동물', icon: 'pets' },
  { slug: 'tools', label: '공구/산업', icon: 'build' },
  { slug: 'interior', label: '인테리어', icon: 'local_florist' },
  { slug: 'food', label: '식품/음료', icon: 'restaurant' },
  { slug: 'auto', label: '자동차', icon: 'directions_car' },
  { slug: 'kids', label: '유아동', icon: 'child_care' },
];

const SUBCATEGORIES: Record<string, { name: string; image: string }[]> = {
  living: [
    { name: '주방용품', image: 'https://picsum.photos/seed/sub1/200/200' },
    { name: '욕실용품', image: 'https://picsum.photos/seed/sub2/200/200' },
    { name: '세탁용품', image: 'https://picsum.photos/seed/sub3/200/200' },
    { name: '수납/정리', image: 'https://picsum.photos/seed/sub4/200/200' },
    { name: '청소용품', image: 'https://picsum.photos/seed/sub5/200/200' },
    { name: '주방가전', image: 'https://picsum.photos/seed/sub6/200/200' },
    { name: '식기/컵', image: 'https://picsum.photos/seed/sub7/200/200' },
    { name: '조리도구', image: 'https://picsum.photos/seed/sub8/200/200' },
    { name: '생활잡화', image: 'https://picsum.photos/seed/sub9/200/200' },
  ],
  fashion: [
    { name: '여성의류', image: 'https://picsum.photos/seed/fsub1/200/200' },
    { name: '남성의류', image: 'https://picsum.photos/seed/fsub2/200/200' },
    { name: '가방', image: 'https://picsum.photos/seed/fsub3/200/200' },
    { name: '신발', image: 'https://picsum.photos/seed/fsub4/200/200' },
    { name: '액세서리', image: 'https://picsum.photos/seed/fsub5/200/200' },
    { name: '시계/쥬얼리', image: 'https://picsum.photos/seed/fsub6/200/200' },
  ],
  digital: [
    { name: '스마트폰 악세서리', image: 'https://picsum.photos/seed/dsub1/200/200' },
    { name: '컴퓨터 주변기기', image: 'https://picsum.photos/seed/dsub2/200/200' },
    { name: '이어폰/헤드셋', image: 'https://picsum.photos/seed/dsub3/200/200' },
    { name: '충전기/케이블', image: 'https://picsum.photos/seed/dsub4/200/200' },
    { name: 'LED/조명', image: 'https://picsum.photos/seed/dsub5/200/200' },
    { name: '카메라 악세서리', image: 'https://picsum.photos/seed/dsub6/200/200' },
  ],
};

const POPULAR_KEYWORDS: Record<string, string[]> = {
  living: ['실리콘 주방장갑', '스테인리스 건조대', '무선 믹서기', '에코 세제', '자동 디스펜서'],
  fashion: ['린넨 원피스', '스니커즈', '미니 크로스백', '실버 반지', '여름 샌들'],
  digital: ['USB-C 허브', 'LED 스트립', '무선 충전기', '블루투스 스피커', '보조배터리'],
};

const CATEGORY_PRODUCT_NAMES: Record<string, string[]> = {
  living: ['실리콘 조리도구 세트', '스테인리스 건조대', '무선 전동 믹서기', '자동 비누 디스펜서', '내열 유리 밀폐용기', '세라믹 칼 세트', '접이식 세탁 바구니', '다용도 수납 선반'],
  fashion: ['레이어드 체인 목걸이', '캔버스 크로스백', '가죽 벨트 남녀공용', '선글라스 UV400', '실크 스카프 봄용', '미니 클러치 파우치', '스터드 귀걸이 세트', '니트 비니 모자'],
  digital: ['USB-C 멀티허브 7in1', 'LED 무드등 RGB', '무선 블루투스 이어폰', '보조배터리 10000mAh', 'USB 선풍기 탁상용', '노트북 거치대 접이식', '스마트워치 밴드', '무선 충전 패드'],
  beauty: ['메이크업 브러쉬 15종', '접이식 거울 LED', '네일아트 스티커 세트', '실리콘 세안 브러쉬', '뷰티 블렌더 세트', '속눈썹 뷰러 전문가용', '마사지 롤러 옥석', '화장품 정리함 아크릴'],
  stationery: ['감성 다이어리 A5', '마스킹 테이프 30종', '컬러 젤펜 세트 12색', '미니 스탬프 세트', '데스크 오거나이저', '메모 패드 귀여운', '북마크 금속 클립', '형광펜 파스텔 6색'],
  sports: ['요가 매트 TPE 6mm', '접이식 캠핑 체어', '저항 밴드 5단계', '점프 로프 디지털', '수영 고글 방김', '런닝 암밴드 스마트폰', '복근 운동 롤러', '운동 물병 1L'],
  default: ['인기 도매 상품', '베스트셀러 상품', '신상품 입고', '한정 특가 상품', '추천 소싱 상품', '대량구매 할인', '샘플 구매 가능', '즉시 출고 상품'],
};

function generateCategoryProducts(slug: string): Product[] {
  const names = CATEGORY_PRODUCT_NAMES[slug] || CATEGORY_PRODUCT_NAMES['default'];
  return Array.from({ length: 16 }, (_, i) => {
    const baseProduct = DETAILED_PRODUCTS[i % DETAILED_PRODUCTS.length];
    const priceKRW = Math.floor(Math.random() * 60000) + 2000;
    const badges: Array<Product['badge']> = [null, 'TOP', null, 'SALE', null, 'HOT', null, null];
    return {
      id: `cat-${slug}-${i}`,
      name: names[i % names.length],
      imageUrl: `https://picsum.photos/seed/cat${slug}${i}/400/400`,
      category: MAIN_CATEGORIES.find((c) => c.slug === slug)?.label || slug,
      priceKRW,
      originalPriceKRW: i % 4 === 0 ? Math.floor(priceKRW * 1.2) : undefined,
      priceCNY: Math.floor(priceKRW / 190),
      discountPercent: i % 4 === 0 ? 20 : undefined,
      moq: [10, 20, 50, 100][i % 4],
      salesCount: Math.floor(Math.random() * 5000),
      badge: badges[i % badges.length],
      shopName: baseProduct.shopNameKo,
    };
  });
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeCategory, setActiveCategory] = useState(slug || 'living');
  const currentCat = MAIN_CATEGORIES.find((c) => c.slug === activeCategory);
  const subcategories = SUBCATEGORIES[activeCategory] || SUBCATEGORIES['living'] || [];
  const keywords = POPULAR_KEYWORDS[activeCategory] || POPULAR_KEYWORDS['living'] || [];
  const products = generateCategoryProducts(activeCategory);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-24 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/20 overflow-y-auto">
          <nav className="py-2">
            {MAIN_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={cn(
                  'w-full flex flex-col items-center gap-1 py-3 px-1 text-center transition-colors relative',
                  activeCategory === cat.slug
                    ? 'bg-primary/5 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container'
                )}
              >
                {/* Active indicator */}
                {activeCategory === cat.slug && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-primary rounded-r-full" />
                )}
                <span
                  className={cn(
                    'material-symbols-outlined text-[22px]',
                    activeCategory === cat.slug ? 'text-primary' : ''
                  )}
                  style={
                    activeCategory === cat.slug
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {cat.icon}
                </span>
                <span className="text-[10px] md:text-[11px] font-medium leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Category header */}
          <div>
            <h1 className="text-lg font-heading font-bold text-on-surface mb-1">
              {currentCat?.label || '카테고리'}
            </h1>
            <p className="text-xs text-on-surface-variant">
              {subcategories.length}개 하위 카테고리
            </p>
          </div>

          {/* Subcategory grid */}
          <section>
            <div className="grid grid-cols-3 gap-3">
              {subcategories.map((sub) => (
                <Link
                  key={sub.name}
                  href={`/search?q=${encodeURIComponent(sub.name)}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/30 hover:shadow-soft transition-all"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-surface-container">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className="text-[11px] md:text-xs font-medium text-on-surface text-center leading-tight">
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Promotional banner */}
          <section>
            <div className="bg-gradient-to-r from-secondary to-secondary-container rounded-xl p-4 md:p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px]">campaign</span>
                <div>
                  <h3 className="font-heading font-bold text-sm md:text-base">
                    {currentCat?.label} 할인 기획전
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    인기 상품 최대 40% 할인 진행 중
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Popular products */}
          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-3">
              인기 상품
            </h2>
            <ProductGrid products={products} columns={2} />
          </section>

          {/* Popular keywords */}
          <section className="pb-4">
            <h2 className="text-base font-heading font-bold text-on-surface mb-3">
              인기 검색어
            </h2>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw) => (
                <Link
                  key={kw}
                  href={`/search?q=${encodeURIComponent(kw)}`}
                  className="px-3 py-1.5 rounded-full bg-surface-container text-xs font-medium text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {kw}
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
