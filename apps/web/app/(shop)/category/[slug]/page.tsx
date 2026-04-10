'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';

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

// Category search queries for Yiwugo API
const CATEGORY_QUERIES: Record<string, string> = {
  living: '生活用品',
  fashion: '服装',
  digital: '电子产品',
  beauty: '美容',
  stationery: '文具',
  sports: '运动',
  pets: '宠物',
  tools: '工具',
  interior: '家居装饰',
  food: '食品',
  auto: '汽车配件',
  kids: '儿童',
};

const POPULAR_KEYWORDS: Record<string, string[]> = {
  living: ['실리콘 주방장갑', '스테인리스 건조대', '무선 믹서기', '에코 세제', '자동 디스펜서'],
  fashion: ['린넨 원피스', '스니커즈', '미니 크로스백', '실버 반지', '여름 샌들'],
  digital: ['USB-C 허브', 'LED 스트립', '무선 충전기', '블루투스 스피커', '보조배터리'],
  beauty: ['메이크업 브러쉬', '네일아트 스티커', '실리콘 세안 브러쉬', '마사지 롤러'],
  stationery: ['감성 다이어리', '마스킹 테이프', '컬러 젤펜', '데스크 오거나이저'],
  sports: ['요가 매트', '저항 밴드', '캠핑 체어', '운동 물병'],
  default: ['인기 도매 상품', '베스트셀러', '신상품', '특가 상품'],
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [activeCategory, setActiveCategory] = useState(slug || 'living');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const currentCat = MAIN_CATEGORIES.find((c) => c.slug === activeCategory);
  const keywords = POPULAR_KEYWORDS[activeCategory] || POPULAR_KEYWORDS['default'] || [];

  useEffect(() => {
    setLoading(true);
    const query = CATEGORY_QUERIES[activeCategory] || currentCat?.label || '';
    fetch(`/api/products/search?q=${encodeURIComponent(query)}&pageSize=20`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, currentCat?.label]);

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
          </div>

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
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[280px] bg-surface-container rounded-xl animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <ProductGrid products={products} columns={2} />
            ) : (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">inventory_2</span>
                <p className="text-on-surface-variant mt-3 text-sm">상품을 불러오는 중입니다...</p>
              </div>
            )}
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
