'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductPrice from '@/components/product/ProductPrice';
import CostBreakdown from '@/components/product/CostBreakdown';
import ImportDisclaimer from '@/components/product/ImportDisclaimer';
import SizeGuide from '@/components/product/SizeGuide';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useTranslatedText } from '@/hooks/useTranslation';
import { useUIStore } from '@/stores/ui-store';

const MOCK_REVIEWS = [
  { id: '1', user: '김**', rating: 5, date: '2026-03-28', content: '품질 좋고 색상이 예뻐요. 대량 주문에도 일관된 품질입니다.' },
  { id: '2', user: '이**', rating: 4, date: '2026-03-25', content: 'MOQ 이상 주문했는데 배송도 빠르고 좋습니다. 리모컨 반응 약간 느림.' },
  { id: '3', user: '박**', rating: 5, date: '2026-03-20', content: '재주문입니다. 변함없이 좋아요. 패키징도 깔끔합니다.' },
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

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(productId));
  const showToast = useUIStore((s) => s.showToast);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProduct(data);
          setQuantity(data.minOrder || 10);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="pb-20">
        <div className="aspect-square bg-surface-container animate-pulse" />
        <div className="px-4 py-4 space-y-3">
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
        <button onClick={() => router.back()} className="mt-4 text-primary text-sm font-medium">
          뒤로가기
        </button>
      </div>
    );
  }

  const translatedTitle = useTranslatedText(product.title);
  const translatedShopName = useTranslatedText(product.shopName);
  const images = product.images?.length > 0 ? product.images : [product.imageUrl].filter(Boolean);
  const priceCny = parseFloat(product.priceCny) || 0;
  const moq = product.minOrder || 1;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.title,
      shopId: product.shopId,
      shopName: product.shopName,
      imageUrl: images[0] || '',
      priceKrw: product.priceKrw,
      priceCny: priceCny,
      quantity,
      options: '',
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
      category: '',
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'detail', label: '상세정보' },
    { key: 'reviews', label: '리뷰 (3)' },
    { key: 'inquiry', label: '문의하기' },
  ];

  return (
    <div className="pb-20">
      {/* Image Gallery - constrained on desktop */}
      <div className="relative bg-surface-container max-w-2xl mx-auto">
        <div className="aspect-square max-h-[500px] overflow-hidden">
          {images[currentImage] ? (
            <img
              src={images[currentImage]}
              alt={product.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30">image</span>
            </div>
          )}
        </div>
        {images.length > 1 && (
          <>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
              {currentImage + 1}/{images.length}
            </div>
            <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={cn(
                    'w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors',
                    i === currentImage ? 'border-primary' : 'border-transparent'
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
            priceKRW={product.priceKrw}
            priceCNY={priceCny}
            size="lg"
          />

          <div className="mt-3">
            <h1 className="text-base font-medium text-on-surface leading-snug">
              {translatedTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
            <span>누적 {(product.salesCount || 0).toLocaleString()}+ 판매</span>
            <span>|</span>
            <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-medium">
              MOQ {moq}개
            </span>
            {product.boothNumber && (
              <>
                <span>|</span>
                <span>부스 {product.boothNumber}</span>
              </>
            )}
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

        {/* Shop Info Card */}
        {product.shopName && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-on-surface-variant/40">store</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-on-surface truncate">{translatedShopName}</h4>
                {product.boothNumber && (
                  <p className="text-[10px] text-on-surface-variant mt-0.5">
                    부스: {product.boothNumber}
                  </p>
                )}
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

        {/* Quantity */}
        <div className="px-4 mt-4">
          <h3 className="text-sm font-semibold text-on-surface mb-2">
            수량{' '}
            <span className="text-[10px] font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">
              MOQ {moq}개
            </span>
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(moq, quantity - 10))}
              className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center hover:border-primary transition-colors"
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
              className="w-20 h-9 text-center border border-outline-variant/40 rounded-lg text-sm font-medium bg-transparent focus:border-primary focus:outline-none"
            />
            <button
              onClick={() => setQuantity(quantity + 10)}
              className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center hover:border-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <span className="text-xs text-on-surface-variant ml-2">
              합계 <span className="font-bold text-primary">{(product.priceKrw * quantity).toLocaleString()}원</span>
            </span>
          </div>
        </div>

        {/* Price Tiers */}
        {product.priceTiers && product.priceTiers.length > 1 && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-secondary">sell</span>
              수량별 단가
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {product.priceTiers.map((tier, i) => (
                <div
                  key={i}
                  className={cn(
                    'text-center p-2 rounded-lg border transition-colors',
                    quantity >= tier.startNumber && (tier.endNumber === null || quantity <= tier.endNumber)
                      ? 'border-primary bg-primary/5'
                      : 'border-outline-variant/20'
                  )}
                >
                  <p className="text-[10px] text-on-surface-variant">
                    {tier.startNumber}{tier.endNumber ? `~${tier.endNumber}` : '+'}개
                  </p>
                  <p className="text-sm font-bold text-on-surface">
                    ¥{tier.sellPrice.toFixed(2)}
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    ≈ {Math.round(tier.sellPrice * 190 * 1.05).toLocaleString()}원
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SKU Options */}
        {product.skuOptions && product.skuOptions.length > 0 && (
          <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3">
              옵션 ({product.skuOptions.length}종)
            </h3>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {product.skuOptions.map((sku, i) => (
                <button
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-outline-variant/30 hover:border-primary/50 transition-colors flex-shrink-0"
                >
                  {sku.imageUrl && (
                    <img
                      src={sku.imageUrl}
                      alt={sku.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-xs font-medium text-on-surface whitespace-nowrap">
                    {sku.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Market Info */}
        {product.marketInfo && (
          <div className="mx-4 mt-3 px-3 py-2 bg-surface-container rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">location_on</span>
            <span className="text-xs text-on-surface-variant">{product.marketInfo}</span>
          </div>
        )}

        {/* Specs Table */}
        {specs.length > 0 && (
          <div className="mx-4 mt-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3">상품 사양</h3>
            <div className="space-y-2">
              {specs.map(([key, value], i) => (
                <div key={i} className="flex items-center py-1.5 border-b border-outline-variant/10 last:border-0">
                  <span className="text-xs text-on-surface-variant w-24 flex-shrink-0">{key}</span>
                  <span className="text-xs font-medium text-on-surface">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-6 border-t border-outline-variant/20">
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

          <div className="px-4 py-5">
            {activeTab === 'detail' && (
              <div className="space-y-4">
                {product.description ? (
                  <p className="text-sm leading-relaxed text-on-surface">{product.description}</p>
                ) : (
                  <p className="text-sm text-on-surface-variant">상세 정보가 없습니다.</p>
                )}
                {images.length > 2 && (
                  <div className="mt-4 space-y-2">
                    {images.slice(2, 6).map((img, i) => (
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
              <div className="space-y-4">
                {MOCK_REVIEWS.map((review) => (
                  <div key={review.id} className="pb-4 border-b border-outline-variant/20 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-on-surface">{review.user}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={cn(
                                'material-symbols-outlined text-[12px]',
                                star <= review.rating ? 'text-secondary-container' : 'text-stone-300'
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
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'inquiry' && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[48px] text-stone-300 mb-3">
                  chat_bubble_outline
                </span>
                <p className="text-sm text-on-surface-variant mb-4">
                  궁금한 점이 있으시면 문의해 주세요
                </p>
                <button className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-container transition-colors">
                  문의 작성하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuide
        type="clothing"
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface-container-lowest border-t border-outline-variant/20 px-4 py-3 z-40">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <button
            onClick={handleToggleWishlist}
            className="w-11 h-11 flex items-center justify-center rounded-xl border border-outline-variant/40 hover:border-primary transition-colors flex-shrink-0"
          >
            <span
              className={cn(
                'material-symbols-outlined text-[22px]',
                isWishlisted ? 'text-primary' : 'text-on-surface-variant'
              )}
              style={isWishlisted ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              favorite
            </span>
          </button>
          <button className="w-11 h-11 flex items-center justify-center rounded-xl border border-outline-variant/40 hover:border-primary transition-colors flex-shrink-0">
            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 h-11 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors"
          >
            장바구니
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            바로구매
          </button>
        </div>
      </div>
    </div>
  );
}
