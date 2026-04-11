'use client';

import { useEffect, useState } from 'react';
import ProductCard, { Product } from './ProductCard';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RecommendedProductsProps {
  /** 추천 유형 */
  type: 'personalized' | 'similar' | 'also-bought';
  /** similar/also-bought일 때 기준 상품 ID */
  productId?: string;
  /** 표시할 상품 수 */
  limit?: number;
  /** 섹션 제목 */
  title?: string;
  /** 제외할 상품 ID 목록 */
  excludeIds?: string[];
  className?: string;
}

function mapToProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.titleKo || raw.name || '',
    imageUrl: raw.imageProxyUrls?.[0] || raw.imageUrls?.[0] || '',
    priceKRW: Number(raw.priceKrw || 0),
    originalPriceKRW: raw.originalPriceKrw ? Number(raw.originalPriceKrw) : undefined,
    salesCount: raw.salesCount,
    reviewCount: raw.reviewCount,
    rating: raw.averageRating,
    shopName: raw.shop?.nameKo,
  };
}

const defaultTitles: Record<string, string> = {
  personalized: '맞춤 추천 상품',
  similar: '비슷한 상품',
  'also-bought': '함께 구매한 상품',
};

export default function RecommendedProducts({
  type,
  productId,
  limit = 10,
  title,
  excludeIds = [],
  className,
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        let url = '';
        const params = new URLSearchParams();
        params.set('limit', String(limit));

        if (type === 'personalized') {
          url = `${API_URL}/recommendations/personalized`;
          if (excludeIds.length > 0) params.set('exclude', excludeIds.join(','));
        } else if (type === 'similar' && productId) {
          url = `${API_URL}/recommendations/similar/${productId}`;
        } else if (type === 'also-bought' && productId) {
          url = `${API_URL}/recommendations/also-bought/${productId}`;
        } else {
          setLoading(false);
          return;
        }

        const res = await fetch(`${url}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          const items = (data.data || data || []).map(mapToProduct);
          setProducts(items);
        }
      } catch {
        // 추천 실패해도 UI에 영향 없음
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [type, productId, limit, excludeIds.join(',')]);

  // 추천 상품 없으면 렌더링하지 않음
  if (!loading && products.length === 0) return null;

  const displayTitle = title || defaultTitles[type] || '추천 상품';

  return (
    <section className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-base flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
          {displayTitle}
        </h2>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="w-40 shrink-0 rounded-xl bg-surface-container animate-pulse"
            >
              <div className="aspect-square rounded-t-xl bg-surface-container-high" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-surface-container-high rounded w-full" />
                <div className="h-4 bg-surface-container-high rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {products.map((product) => (
            <div key={product.id} className="w-40 shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
