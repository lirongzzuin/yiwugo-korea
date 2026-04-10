'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';

type ShopTab = 'all' | 'info';

interface ShopDetail {
  id: string;
  shopName: string;
  mainProduct: string;
  introduction: string;
  boothNo: string;
  pictureUrl: string;
  shopImageUrl: string;
  contacter: string;
  telephone: string;
  mobile: string;
  subMarket: string;
  subFloor: string;
  marketInfo: string;
  productCount: number;
  credit: number;
  integrityFraction: number;
  licenseImg: string;
  products: Array<{
    id: string;
    title: string;
    imageUrl: string;
    sellPrice: number;
    salesCount: number;
  }>;
}

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  const [activeTab, setActiveTab] = useState<ShopTab>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [shop, setShop] = useState<ShopDetail | null>(null);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    // Fetch shop detail
    fetch(`/api/shops/${shopId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setShop(data);
          // Convert srplist products to Product format
          if (data.products && Array.isArray(data.products)) {
            setShopProducts(
              data.products.map((p: any) => ({
                id: p.id,
                name: p.title || '',
                imageUrl: p.imageUrl || '',
                priceKRW: Math.round((Number(p.sellPrice || 0) > 100 ? Number(p.sellPrice) / 100 : Number(p.sellPrice)) * 180 * 1.05),
                priceCNY: Number(p.sellPrice || 0) > 100 ? Number(p.sellPrice) / 100 : Number(p.sellPrice),
                salesCount: p.salesCount || 0,
                shopName: data.shopName || '',
              }))
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Also fetch shop's products via search
    fetch(`/api/shops/${shopId}/products?pageSize=20`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          setShopProducts((prev) => {
            // Merge, preferring search results
            const ids = new Set(data.products.map((p: Product) => p.id));
            const existing = prev.filter((p) => !ids.has(p.id));
            return [...data.products, ...existing];
          });
        }
      })
      .catch(() => {});
  }, [shopId]);

  const filteredProducts = searchQuery
    ? shopProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : shopProducts;

  const tabs: { key: ShopTab; label: string }[] = [
    { key: 'all', label: '전체상품' },
    { key: 'info', label: '상점정보' },
  ];

  if (loading) {
    return (
      <div>
        <div className="h-40 bg-surface-container animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
          <div className="h-24 bg-surface-container rounded-xl animate-pulse" />
          <div className="h-64 bg-surface-container rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">store</span>
        <p className="text-on-surface-variant mt-4">상점을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 md:h-56 bg-surface-container">
        {shop.shopImageUrl ? (
          <img
            src={shop.shopImageUrl}
            alt={`${shop.shopName} 배너`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Shop Profile Card */}
        <div className="mx-4 -mt-10 relative z-10 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border-2 border-surface-container-lowest flex-shrink-0 -mt-8">
              {shop.pictureUrl ? (
                <img src={shop.pictureUrl} alt={shop.shopName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <span className="material-symbols-outlined text-[28px] text-primary">store</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-base font-heading font-bold text-on-surface truncate">
                {shop.shopName}
              </h1>
              {shop.boothNo && (
                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  부스: {shop.boothNo}
                  {shop.marketInfo && <span className="text-on-surface-variant/50"> | {shop.marketInfo}</span>}
                </p>
              )}
              {shop.mainProduct && (
                <p className="text-[10px] text-on-surface-variant/60 mt-0.5">
                  주요 제품: {shop.mainProduct}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-outline-variant/20 text-center">
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {(shop.productCount || 0).toLocaleString()}
              </p>
              <p className="text-[10px] text-on-surface-variant">상품수</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {shop.credit || 0}
              </p>
              <p className="text-[10px] text-on-surface-variant">신용등급</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {shop.integrityFraction || 0}
              </p>
              <p className="text-[10px] text-on-surface-variant">신뢰도</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1',
                isFollowing
                  ? 'bg-surface-container text-on-surface-variant'
                  : 'bg-primary text-white hover:bg-primary-container'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isFollowing ? 'check' : 'add'}
              </span>
              {isFollowing ? '팔로잉' : '상점 찜'}
            </button>
            <button className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[18px]">chat</span>
              문의하기
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 border-b border-outline-variant/20 sticky top-14 md:top-16 bg-surface z-20">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-4 py-4">
          {activeTab === 'all' && (
            <>
              {/* Search within shop */}
              <div className="mb-4">
                <div className="relative">
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
                    search
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="이 상점에서 검색"
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} columns={2} />
              ) : (
                <div className="text-center py-10">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">inventory_2</span>
                  <p className="text-on-surface-variant mt-3 text-sm">상품이 없습니다.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* About */}
              {shop.introduction && (
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-2">상점 소개</h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{shop.introduction}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-on-surface mb-2">상점 정보</h3>
                {[
                  shop.boothNo && { icon: 'location_on', label: '부스 번호', value: shop.boothNo },
                  shop.marketInfo && { icon: 'store', label: '시장 정보', value: shop.marketInfo },
                  shop.subMarket && { icon: 'map', label: '구역', value: `${shop.subMarket} ${shop.subFloor || ''}`.trim() },
                  shop.contacter && { icon: 'person', label: '담당자', value: shop.contacter },
                  shop.telephone && { icon: 'phone', label: '전화', value: shop.telephone },
                  { icon: 'inventory_2', label: '등록 상품', value: `${(shop.productCount || 0).toLocaleString()}개` },
                ].filter(Boolean).map((info: any) => (
                  <div key={info.label} className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{info.icon}</span>
                    <span className="text-sm text-on-surface-variant w-20">{info.label}</span>
                    <span className="text-sm font-medium text-on-surface">{info.value}</span>
                  </div>
                ))}
              </div>

              {/* License */}
              {shop.licenseImg && (
                <div>
                  <h3 className="text-sm font-semibold text-on-surface mb-2">사업자 등록</h3>
                  <img src={shop.licenseImg} alt="사업자 등록증" className="w-full max-w-sm rounded-lg" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
