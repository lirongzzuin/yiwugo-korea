'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductPrice from '@/components/product/ProductPrice';
import CostBreakdown from '@/components/product/CostBreakdown';
import ImportDisclaimer from '@/components/product/ImportDisclaimer';
import SizeGuide from '@/components/product/SizeGuide';
import RecommendedProducts from '@/components/product/RecommendedProducts';
import RecentlyViewed from '@/components/product/RecentlyViewed';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { useRecentStore } from '@/stores/recent-store';

const MOCK_REVIEWS = [
  { id: '1', user: '김**', rating: 5, date: '2026-03-28', content: '품질 좋고 색상이 예뻐요. 대량 주문에도 일관된 품질입니다.', tags: ['품질 좋음', '색상 정확'] },
  { id: '2', user: '이**', rating: 4, date: '2026-03-25', content: 'MOQ 이상 주문했는데 배송도 빠르고 좋습니다. 리모컨 반응 약간 느림.', tags: ['배송 빠름'] },
  { id: '3', user: '박**', rating: 5, date: '2026-03-20', content: '재주문입니다. 변함없이 좋아요. 패키징도 깔끔합니다.', tags: ['재주문', '패키징 좋음'] },
];

type TabKey = 'detail' | 'reviews' | 'inquiry';

interface PriceTier {
  startNumber: number;
  endNumber: number | null;
  sellPrice: number;
}

interface SkuOption {
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
}

interface ProductDetail {
  id: string;
  title: string;
  priceKrw: number;
  priceCny: string;
  imageUrl: string;
  images: string[];
  shopName: string;
  shopId: string;
  salesCount: number;
  minOrder: number;
  boothNumber: string;
  description: string;
  specifications: Record<string, string>;
  mainProduct: string;
  priceTiers?: PriceTier[];
  skuOptions?: SkuOption[];
  metric?: string;
  marketInfo?: string;
  defaultFreight?: string;
  categoryId?: string;
  categoryName?: string;
  parentCategoryName?: string;
  averageRating?: number;
  reviewCount?: number;
  responseRate?: number;
  yearsInBusiness?: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(10);
  const [activeTab, setActiveTab] = useState<TabKey>('detail');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedSku, setSelectedSku] = useState<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const showToast = useUIStore((s) => s.showToast);
  const addRecentItem = useRecentStore((s: any) => s.addItem);

  // 서버에서 이미 번역된 데이터를 보내므로 클라이언트 번역은 불필요
  // tr 객체는 호환성을 위해 유지하되 비어있음
  const tr: Record<string, string> = {};

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    setCurrentImage(0);
    setSelectedSku(null);
    setImageLoaded(false);
    // AbortController로 이전 요청 취소 (빠른 네비게이션 대응)
    const controller = new AbortController();
    fetch(`/api/products/${productId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProduct(data);
          setQuantity(data.minOrder || 10);
          // 최근 본 상품에 기록 (서버에서 이미 번역된 이름 사용)
          addRecentItem({
            id: String(data.id || productId),
            name: data.title || '',
            imageUrl: data.images?.[0] || data.imageUrl || '',
            priceKRW: data.priceKrw || 0,
            priceCNY: parseFloat(data.priceCny) || 0,
            category: data.categoryName || '',
            viewedAt: new Date().toISOString(),
          });
        }
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') console.error(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [productId, addRecentItem]);

  const t = (text: string) => tr[text] || text;

  if (loading) {
    return (
      <div className="pb-20">
        <div className="max-w-2xl mx-auto aspect-square max-h-[500px] bg-surface-container animate-pulse" />
        <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
          <div className="h-3 w-48 bg-surface-container rounded animate-pulse" />
          <div className="h-6 w-32 bg-surface-container rounded animate-pulse" />
          <div className="h-4 w-full bg-surface-container rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-surface-container rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">error_outline</span>
        <p className="text-on-surface-variant mt-4">상품을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 text-primary text-sm font-medium">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : [product.imageUrl].filter(Boolean);
  const priceCny = parseFloat(product.priceCny) || 0;
  const moq = product.minOrder || 1;
  const avgRating = product.averageRating || 4.5;
  const reviewCount = product.reviewCount || MOCK_REVIEWS.length;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.title,
      shopId: product.shopId,
      shopName: product.shopName,
      imageUrl: images[0] || '',
      priceKrw: selectedSku !== null && product.skuOptions
        ? Math.round(product.skuOptions[selectedSku].price * 190 * 1.05)
        : product.priceKrw,
      priceCny: priceCny,
      quantity,
      options: selectedSku !== null && product.skuOptions
        ? product.skuOptions[selectedSku].name
        : '',
      minOrderQty: moq,
    });
    showToast('장바구니에 추가되었습니다', 'success');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      productName: product.title,
      imageUrl: images[0] || '',
      priceKrw: product.priceKrw,
      priceCny: priceCny,
      category: product.categoryName || '',
      addedAt: new Date().toISOString(),
    });
    showToast(
      isWishlisted ? '찜 목록에서 제거되었습니다' : '찜 목록에 추가되었습니다',
      'success'
    );
  };

  const specs = product.specifications
    ? Object.entries(product.specifications).filter(([, v]) => v)
    : [];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'detail', label: '상세정보' },
    { key: 'reviews', label: '리뷰', count: reviewCount },
    { key: 'inquiry', label: '문의하기' },
  ];

  return (
    <div className="pb-20">
      {/* Category Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-1 text-xs text-on-surface-variant overflow-x-auto scrollbar-hide">
        <Link href="/" className="hover:text-primary transition-colors shrink-0">홈</Link>
        <span className="material-symbols-outlined text-[14px] shrink-0">chevron_right</span>
        {product.parentCategoryName && (
          <>
            <Link
              href={`/category/${encodeURIComponent(product.parentCategoryName)}`}
              className="hover:text-primary transition-colors shrink-0"
            >
              {t(product.parentCategoryName)}
            </Link>
            <span className="material-symbols-outlined text-[14px] shrink-0">chevron_right</span>
          </>
        )}
        {product.categoryName && (
          <>
            <Link
              href={`/search?categoryId=${product.categoryId || ''}`}
              className="hover:text-primary transition-colors shrink-0"
            >
              {t(product.categoryName)}
            </Link>
            <span className="material-symbols-outlined text-[14px] shrink-0">chevron_right</span>
          </>
        )}
        <span className="text-on-surface truncate font-medium">{t(product.title).slice(0, 20)}...</span>
      </div>

      {/* Image Gallery */}
      <div className="relative bg-white max-w-3xl mx-auto">
        <div className="flex items-center justify-center min-h-[280px] md:min-h-[400px] max-h-[70vh] overflow-hidden bg-surface-container">
          {images[currentImage] ? (
            <>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface-container">
                  <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              )}
              <img
                src={images[currentImage]}
                alt={product.title}
                className={cn(
                  'w-full h-auto max-h-[70vh] object-contain transition-opacity duration-300',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '';
                  setImageLoaded(true);
                }}
              />
            </>
          ) : (
            <div className="w-full h-[300px] flex flex-col items-center justify-center bg-surface-container">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20">image</span>
              <p className="text-xs text-on-surface-variant/40 mt-2">이미지를 불러올 수 없습니다</p>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {currentImage + 1}/{images.length}
            </div>
            <div className="flex gap-1.5 p-2.5 overflow-x-auto scrollbar-hide bg-white">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentImage(i); setImageLoaded(false); }}
                  className={cn(
                    'w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                    i === currentImage ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        <ImportDisclaimer />

        {/* Price Section */}
        <div className="px-4 py-4 bg-surface-container-lowest">
          <ProductPrice
            priceKRW={product.priceKrw || 0}
            priceCNY={priceCny}
            size="lg"
          />

          <div className="mt-3">
            <h1 className="text-base font-medium text-on-surface leading-snug">
              {t(product.title)}
            </h1>
          </div>

          {/* Rating + Sales + MOQ bar */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Star Rating */}
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={cn(
                      'material-symbols-outlined text-[14px]',
                      star <= Math.round(avgRating) ? 'text-amber-500' : 'text-stone-300'
                    )}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-amber-700">{avgRating.toFixed(1)}</span>
              <span className="text-[10px] text-amber-600">({reviewCount})</span>
            </div>

            <span className="text-[10px] text-on-surface-variant/40">|</span>

            <span className="text-xs text-on-surface-variant flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              누적 {(product.salesCount || 0).toLocaleString()}+ 판매
            </span>

            <span className="text-[10px] text-on-surface-variant/40">|</span>

            <span className="bg-surface-container px-2 py-0.5 rounded text-[11px] font-medium text-on-surface-variant">
              MOQ {moq}개
            </span>
          </div>
        </div>

        {/* Shipping & Logistics */}
        <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
          <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-tertiary">local_shipping</span>
            배송 및 물류
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">schedule</span>
              <p className="text-xs font-semibold text-on-surface mt-1">배송 7~14일</p>
              <p className="text-[10px] text-on-surface-variant">예상 소요</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">gavel</span>
              <p className="text-xs font-semibold text-on-surface mt-1">통관 대행</p>
              <p className="text-[10px] text-on-surface-variant">서류 처리</p>
            </div>
            <div>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">fact_check</span>
              <p className="text-xs font-semibold text-on-surface mt-1">검수 서비스</p>
              <p className="text-[10px] text-on-surface-variant">품질 확인</p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <CostBreakdown
          priceCny={priceCny}
          quantity={quantity}
          weightKg={0.5}
        />

        {/* Shop Info Card - Enhanced */}
        {product.shopName && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-primary/60">store</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold text-on-surface truncate">{t(product.shopName)}</h4>
                  <span className="material-symbols-outlined text-[14px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.boothNumber && (
                    <span className="text-[10px] text-on-surface-variant">
                      부스 {product.boothNumber}
                    </span>
                  )}
                  {product.yearsInBusiness && (
                    <span className="text-[10px] text-on-surface-variant">
                      {product.yearsInBusiness}년 운영
                    </span>
                  )}
                  {product.responseRate && (
                    <span className="text-[10px] text-green-600 font-medium">
                      응답률 {product.responseRate}%
                    </span>
                  )}
                </div>
              </div>
              <Link
                href={`/shop/${product.shopId}`}
                className="px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition-colors flex-shrink-0"
              >
                상점방문
              </Link>
            </div>
          </div>
        )}

        {/* SKU Options - Now selectable */}
        {product.skuOptions && product.skuOptions.length > 0 && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3">
              옵션 선택 <span className="text-on-surface-variant font-normal">({product.skuOptions.length}종)</span>
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {product.skuOptions.map((sku, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSku(selectedSku === i ? null : i)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 transition-all flex-shrink-0',
                    selectedSku === i
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-outline-variant/30 hover:border-primary/40'
                  )}
                >
                  {sku.imageUrl && (
                    <img
                      src={sku.imageUrl}
                      alt={sku.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="text-left">
                    <span className="text-xs font-medium text-on-surface whitespace-nowrap block">
                      {t(sku.name)}
                    </span>
                    {sku.price > 0 && (
                      <span className="text-[10px] text-on-surface-variant">
                        ¥{sku.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {selectedSku === i && (
                    <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="px-4 mt-4">
          <h3 className="text-sm font-semibold text-on-surface mb-2">
            수량{' '}
            <span className="text-[10px] font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">
              MOQ {moq}개
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-outline-variant/40 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(moq, quantity - (moq >= 10 ? 10 : 1)))}
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors border-r border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || moq;
                  setQuantity(Math.max(moq, val));
                }}
                className="w-16 h-10 text-center text-sm font-medium bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setQuantity(quantity + (moq >= 10 ? 10 : 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-surface-container transition-colors border-l border-outline-variant/40"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
            <span className="text-xs text-on-surface-variant">
              합계 <span className="font-bold text-primary text-sm">{((product.priceKrw || 0) * quantity).toLocaleString()}원</span>
            </span>
          </div>
        </div>

        {/* Price Tiers */}
        {product.priceTiers && product.priceTiers.length > 1 && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">sell</span>
              수량별 단가
              <span className="text-[10px] text-on-surface-variant font-normal">많이 살수록 저렴!</span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {product.priceTiers.map((tier, i) => {
                const isActive = quantity >= tier.startNumber && (tier.endNumber === null || quantity <= tier.endNumber);
                return (
                  <div
                    key={i}
                    className={cn(
                      'text-center p-2.5 rounded-xl border-2 transition-all',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-outline-variant/20'
                    )}
                  >
                    <p className="text-[10px] text-on-surface-variant">
                      {tier.startNumber}{tier.endNumber ? `~${tier.endNumber}` : '+'}개
                    </p>
                    <p className={cn('text-sm font-bold mt-0.5', isActive ? 'text-primary' : 'text-on-surface')}>
                      ¥{tier.sellPrice.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      ≈ {Math.round(tier.sellPrice * 190 * 1.05).toLocaleString()}원
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Info */}
        {product.marketInfo && (
          <div className="mx-4 mt-3 px-3 py-2.5 bg-surface-container rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">location_on</span>
            <span className="text-xs text-on-surface-variant">{t(product.marketInfo)}</span>
          </div>
        )}

        {/* Specs Table */}
        {specs.length > 0 && (
          <div className="mx-4 mt-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">list_alt</span>
              상품 사양
            </h3>
            <div className="space-y-0">
              {specs.map(([key, value], i) => (
                <div key={i} className={cn(
                  'flex items-center py-2.5 px-2 rounded-lg',
                  i % 2 === 0 ? 'bg-surface-container/50' : ''
                )}>
                  <span className="text-xs text-on-surface-variant w-28 flex-shrink-0 font-medium">{t(key)}</span>
                  <span className="text-xs text-on-surface">{t(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Similar Products - NEW */}
        <div className="mx-4 mt-6">
          <RecommendedProducts
            type="similar"
            productId={productId}
            limit={8}
            title="비슷한 상품"
          />
        </div>

        {/* Tabs */}
        <div className="mt-6 border-t border-outline-variant/20">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex-1 py-3.5 text-sm font-medium text-center border-b-2 transition-colors relative',
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                )}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    'ml-1 text-[10px] font-bold',
                    activeTab === tab.key ? 'text-primary' : 'text-on-surface-variant'
                  )}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="px-4 py-5">
            {activeTab === 'detail' && (
              <div className="space-y-4">
                {product.description ? (
                  <p className="text-sm leading-relaxed text-on-surface">{product.description}</p>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">description</span>
                    <p className="text-sm text-on-surface-variant mt-2">
                      상세 정보가 아직 등록되지 않았습니다.
                    </p>
                    <p className="text-xs text-on-surface-variant/60 mt-1">
                      문의하기 탭에서 판매자에게 직접 문의해 보세요.
                    </p>
                  </div>
                )}
                {images.length > 2 && (
                  <div className="mt-4 space-y-2">
                    {images.slice(2, 8).map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`상세이미지 ${i + 1}`}
                        className="w-full rounded-lg"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                {/* Review Summary Bar */}
                <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl mb-5">
                  <div className="text-center">
                    <p className="text-3xl font-heading font-black text-amber-700">{avgRating.toFixed(1)}</p>
                    <div className="flex gap-0.5 mt-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={cn(
                            'material-symbols-outlined text-[14px]',
                            star <= Math.round(avgRating) ? 'text-amber-500' : 'text-stone-300'
                          )}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-amber-600 mt-0.5">{reviewCount}개 리뷰</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = MOCK_REVIEWS.filter((r) => r.rating === star).length;
                      const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-700 w-4">{star}</span>
                          <div className="flex-1 h-2 bg-amber-200/50 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-outline-variant/20 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-primary">{review.user.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-on-surface">{review.user}</span>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={cn(
                                  'material-symbols-outlined text-[12px]',
                                  star <= review.rating ? 'text-amber-500' : 'text-stone-300'
                                )}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-on-surface-variant">{review.date}</span>
                      </div>
                      <p className="text-sm text-on-surface leading-relaxed">{review.content}</p>
                      {review.tags && (
                        <div className="flex gap-1.5 mt-2">
                          {review.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/5 text-primary font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'inquiry' && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30">
                  chat_bubble_outline
                </span>
                <p className="text-sm text-on-surface-variant mt-3 mb-1">
                  궁금한 점이 있으시면 문의해 주세요
                </p>
                <p className="text-xs text-on-surface-variant/60 mb-5">
                  판매자가 영업시간 내 답변드립니다
                </p>
                <button className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-container transition-colors">
                  문의 작성하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Also Bought - NEW */}
        <div className="mx-4 mb-6">
          <RecommendedProducts
            type="also-bought"
            productId={productId}
            limit={8}
            title="함께 구매한 상품"
          />
        </div>

        {/* Recently Viewed */}
        <div className="mx-4 mb-6">
          <RecentlyViewed excludeId={productId} maxItems={8} />
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide
        type="clothing"
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest/95 backdrop-blur-md border-t border-outline-variant/20 px-4 py-3 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className={cn(
              'w-11 h-11 flex items-center justify-center rounded-xl border transition-all flex-shrink-0',
              isWishlisted
                ? 'border-primary/30 bg-primary/5'
                : 'border-outline-variant/40 hover:border-primary'
            )}
            aria-label={isWishlisted ? '찜 해제' : '찜하기'}
          >
            <span
              className={cn(
                'material-symbols-outlined text-[22px] transition-transform',
                isWishlisted ? 'text-primary scale-110' : 'text-on-surface-variant'
              )}
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
          <button
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-outline-variant/40 hover:border-primary transition-colors flex-shrink-0"
            aria-label="채팅 문의"
          >
            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-11 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all"
          >
            장바구니
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container active:scale-[0.98] transition-all"
          >
            바로구매
          </button>
        </div>
      </div>
    </div>
  );
}
