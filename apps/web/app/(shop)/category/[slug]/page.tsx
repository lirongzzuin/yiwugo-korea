'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';

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

// Slug → Chinese search query mapping (for legacy slug-based URLs)
const SLUG_QUERY_MAP: Record<string, string> = {
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

const SLUG_LABEL_MAP: Record<string, string> = {
  living: '생활/주방',
  fashion: '패션/의류',
  digital: '전자/디지털',
  beauty: '뷰티/건강',
  stationery: '문구/완구',
  sports: '스포츠',
  pets: '반려동물',
  tools: '공구/산업',
  interior: '인테리어',
  food: '식품/음료',
  auto: '자동차',
  kids: '유아동',
};

interface ApiCategory {
  id: number;
  type: string;
  entype: string;
  img?: string;
  rank?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(slug);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  // Fetch API categories on mount
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, []);

  // Fetch products when active category changes
  useEffect(() => {
    setLoading(true);

    let url: string;
    if (activeCategoryId) {
      // Use category ID for API categories
      url = `/api/products/search?q=&categoryId=${activeCategoryId}&pageSize=20`;
    } else {
      // Use slug-based Chinese query for legacy slugs
      const query = SLUG_QUERY_MAP[activeCategory] || activeCategory;
      url = `/api/products/search?q=${encodeURIComponent(query)}&pageSize=20`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeCategory, activeCategoryId]);

  // Build sidebar items: use API categories if loaded, fallback to slug-based
  const sidebarItems = categories.length > 0
    ? categories.map((cat) => ({
        key: String(cat.id),
        label: CATEGORY_NAME_MAP[cat.type] || cat.type,
        icon: CATEGORY_ICON_MAP[cat.type] || 'category',
        categoryId: cat.id,
      }))
    : Object.entries(SLUG_LABEL_MAP).map(([s, label]) => ({
        key: s,
        label,
        icon: 'category',
        categoryId: null as number | null,
      }));

  const currentLabel = activeCategoryId
    ? sidebarItems.find((s) => s.categoryId === activeCategoryId)?.label || '카테고리'
    : SLUG_LABEL_MAP[activeCategory] || '카테고리';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-24 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/20 overflow-y-auto">
          <nav className="py-2">
            {catsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-1 py-3 px-1">
                  <div className="w-6 h-6 bg-surface-container rounded animate-pulse" />
                  <div className="w-10 h-3 bg-surface-container rounded animate-pulse mt-1" />
                </div>
              ))
            ) : (
              sidebarItems.map((item) => {
                const isActive = item.categoryId
                  ? activeCategoryId === item.categoryId
                  : activeCategory === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setActiveCategory(item.key);
                      setActiveCategoryId(item.categoryId);
                    }}
                    className={cn(
                      'w-full flex flex-col items-center gap-1 py-3 px-1 text-center transition-colors relative',
                      isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 bg-primary rounded-r-full" />
                    )}
                    <span
                      className={cn(
                        'material-symbols-outlined text-[22px]',
                        isActive ? 'text-primary' : ''
                      )}
                      style={
                        isActive
                          ? { fontVariationSettings: "'FILL' 1" }
                          : undefined
                      }
                    >
                      {item.icon}
                    </span>
                    <span className="text-[10px] md:text-[11px] font-medium leading-tight">
                      {item.label}
                    </span>
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Category header */}
          <div>
            <h1 className="text-lg font-heading font-bold text-on-surface mb-1">
              {currentLabel}
            </h1>
          </div>

          {/* Promotional banner */}
          <section>
            <div className="bg-gradient-to-r from-secondary to-secondary-container rounded-xl p-4 md:p-5 text-white">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[32px]">campaign</span>
                <div>
                  <h3 className="font-heading font-bold text-sm md:text-base">
                    {currentLabel} 할인 기획전
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
        </main>
      </div>
    </div>
  );
}
