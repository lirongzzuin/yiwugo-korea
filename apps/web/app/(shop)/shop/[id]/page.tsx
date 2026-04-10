'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductGrid from '@/components/product/ProductGrid';
import type { Product } from '@/components/product/ProductCard';

// --- Mock Data ---
const MOCK_SHOP = {
  id: 'shop-1',
  name: 'YiwuLED Official Store',
  logo: 'https://picsum.photos/seed/shoplogo1/200/200',
  banner: 'https://picsum.photos/seed/shopbanner/1200/400',
  verified: true,
  location: '이우시 푸톈구 4구역 3층',
  description: '이우 최대 LED 조명 도매 전문 업체입니다. 15년 이상의 경험으로 최고 품질의 LED 제품을 합리적인 가격에 공급합니다.',
  stats: {
    products: 1240,
    followers: 3560,
    responseRate: 98,
    responseTime: '2시간 이내',
    yearsActive: 15,
  },
};

type ShopTab = 'all' | 'popular' | 'new' | 'info';

function generateShopProducts(prefix: string, count: number): Product[] {
  return Array.from({ length: count }, (_, i) => {
    const priceKRW = Math.floor(Math.random() * 50000) + 3000;
    const badges: Array<Product['badge']> = [null, 'TOP', null, 'SALE', null, 'HOT', null, 'NEW'];
    return {
      id: `${prefix}-${i}`,
      name: `LED ${['무드등', '스트립', '전구', '센서등', '스탠드', '캔들', '네온사인', '벽등'][i % 8]} ${['미니', '대형', '방수', '충전식', 'RGB', '리모컨', '무선', '타이머'][i % 8]}`,
      imageUrl: `https://picsum.photos/seed/${prefix}${i}/400/400`,
      category: '디지털',
      priceKRW,
      originalPriceKRW: i % 3 === 0 ? Math.floor(priceKRW * 1.2) : undefined,
      priceCNY: Math.floor(priceKRW / 190),
      discountPercent: i % 3 === 0 ? 20 : undefined,
      moq: [10, 20, 50, 100][i % 4],
      salesCount: Math.floor(Math.random() * 10000),
      badge: badges[i % badges.length],
      shopName: MOCK_SHOP.name,
    };
  });
}

const ALL_PRODUCTS = generateShopProducts('shop-all', 20);
const POPULAR_PRODUCTS = generateShopProducts('shop-pop', 12);
const NEW_PRODUCTS = generateShopProducts('shop-new', 8);

export default function ShopDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<ShopTab>('all');
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const shop = MOCK_SHOP;

  const tabs: { key: ShopTab; label: string }[] = [
    { key: 'all', label: '전체상품' },
    { key: 'popular', label: '인기상품' },
    { key: 'new', label: '신상품' },
    { key: 'info', label: '상점정보' },
  ];

  const currentProducts = (() => {
    let prods: Product[] = [];
    switch (activeTab) {
      case 'all': prods = ALL_PRODUCTS; break;
      case 'popular': prods = POPULAR_PRODUCTS; break;
      case 'new': prods = NEW_PRODUCTS; break;
      default: prods = [];
    }
    if (searchQuery) {
      prods = prods.filter((p) => p.name.includes(searchQuery));
    }
    return prods;
  })();

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 md:h-56 bg-surface-container">
        <img
          src={shop.banner}
          alt={`${shop.name} 배너`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button className="absolute top-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-on-surface flex items-center gap-1 hover:bg-white transition-colors">
          <span className="material-symbols-outlined text-[16px]">view_in_ar</span>
          VR Store
        </button>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Shop Profile Card */}
        <div className="mx-4 -mt-10 relative z-10 bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-container border-2 border-surface-container-lowest flex-shrink-0 -mt-8">
              <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-heading font-bold text-on-surface truncate">
                  {shop.name}
                </h1>
                {shop.verified && (
                  <span
                    className="material-symbols-outlined text-tertiary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                {shop.location}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-outline-variant/20 text-center">
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {shop.stats.products.toLocaleString()}
              </p>
              <p className="text-[10px] text-on-surface-variant">Products</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {shop.stats.followers.toLocaleString()}
              </p>
              <p className="text-[10px] text-on-surface-variant">Followers</p>
            </div>
            <div>
              <p className="text-lg font-heading font-bold text-on-surface">
                {shop.stats.responseRate}%
              </p>
              <p className="text-[10px] text-on-surface-variant">Response</p>
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
          {activeTab !== 'info' && (
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
              <ProductGrid products={currentProducts} columns={2} />
            </>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* About */}
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-2">상점 소개</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed">{shop.description}</p>
              </div>

              {/* Details */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-on-surface mb-2">상점 정보</h3>
                {[
                  { icon: 'location_on', label: '위치', value: shop.location },
                  { icon: 'schedule', label: '응답시간', value: shop.stats.responseTime },
                  { icon: 'history', label: '운영기간', value: `${shop.stats.yearsActive}년` },
                  { icon: 'inventory_2', label: '등록 상품', value: `${shop.stats.products.toLocaleString()}개` },
                  { icon: 'thumb_up', label: '응답률', value: `${shop.stats.responseRate}%` },
                ].map((info) => (
                  <div key={info.label} className="flex items-center gap-3 py-2 border-b border-outline-variant/10 last:border-0">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">{info.icon}</span>
                    <span className="text-sm text-on-surface-variant w-20">{info.label}</span>
                    <span className="text-sm font-medium text-on-surface">{info.value}</span>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div>
                <h3 className="text-sm font-semibold text-on-surface mb-2">인증</h3>
                <div className="flex gap-2">
                  {['이우시장 인증', 'ISO 9001', 'CE 인증'].map((cert) => (
                    <span
                      key={cert}
                      className="px-3 py-1.5 bg-tertiary/10 text-tertiary text-xs font-medium rounded-lg flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
