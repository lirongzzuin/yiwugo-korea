'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';
import { useTranslatedProducts } from '@/hooks/useTranslation';

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

interface ApiCategory {
  id: number;
  type: string;
  entype: string;
}

export default function CategoryPage() {
  const params = useParams();
  const slug = decodeURIComponent(params.slug as string);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [activeType, setActiveType] = useState<string>(slug);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);
  const products = useTranslatedProducts(rawProducts);

  // Fetch API categories
  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          // If slug matches a Chinese type name, use it; otherwise find closest match
          const match = data.find((c: ApiCategory) => c.type === slug);
          if (match) {
            setActiveType(match.type);
          }
        }
      })
      .catch(() => {})
      .finally(() => setCatsLoading(false));
  }, [slug]);

  // Fetch products when active category changes
  useEffect(() => {
    setLoading(true);
    const query = activeType;
    fetch(`/api/products/search?q=${encodeURIComponent(query)}&pageSize=24`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.data && Array.isArray(data.data)) {
          setRawProducts(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeType]);

  const currentLabel = CATEGORY_NAME_MAP[activeType] || activeType;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex min-h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <aside className="w-20 md:w-24 flex-shrink-0 bg-surface-container-lowest border-r border-outline-variant/20 overflow-y-auto">
          <nav className="py-2">
            {catsLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-full flex flex-col items-center gap-1 py-3 px-1">
                  <div className="w-6 h-6 bg-surface-container rounded animate-pulse" />
                  <div className="w-10 h-3 bg-surface-container rounded animate-pulse mt-1" />
                </div>
              ))
            ) : (
              categories.map((cat) => {
                const isActive = activeType === cat.type;
                const label = CATEGORY_NAME_MAP[cat.type] || cat.type;
                const icon = CATEGORY_ICON_MAP[cat.type] || 'category';
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveType(cat.type)}
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
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {icon}
                    </span>
                    <span className="text-[10px] md:text-[11px] font-medium leading-tight">
                      {label}
                    </span>
                  </button>
                );
              })
            )}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div>
            <h1 className="text-lg font-heading font-bold text-on-surface mb-1">
              {currentLabel}
            </h1>
          </div>

          {/* Promotional banner */}
          <div className="bg-gradient-to-r from-secondary to-secondary-container rounded-xl p-4 md:p-5 text-white">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[32px]">campaign</span>
              <div>
                <h3 className="font-heading font-bold text-sm md:text-base">
                  {currentLabel} 인기 상품
                </h3>
                <p className="text-xs text-white/80 mt-0.5">
                  이우 시장 도매가로 만나보세요
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-3">
              상품 목록
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
                <p className="text-on-surface-variant mt-3 text-sm">해당 카테고리에 상품이 없습니다.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
