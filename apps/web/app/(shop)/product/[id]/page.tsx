'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductPrice from '@/components/product/ProductPrice';
import CostBreakdown from '@/components/product/CostBreakdown';
import ImportDisclaimer from '@/components/product/ImportDisclaimer';
import TranslationToggle from '@/components/product/TranslationToggle';
import TranslationBadge from '@/components/product/TranslationBadge';
import SizeGuide from '@/components/product/SizeGuide';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';
import { DETAILED_PRODUCTS } from '@/lib/mock-data';

const MOCK_REVIEWS = [
  { id: '1', user: '김**', rating: 5, date: '2026-03-28', content: '품질 좋고 색상이 예뻐요. 대량 주문에도 일관된 품질입니다.' },
  { id: '2', user: '이**', rating: 4, date: '2026-03-25', content: 'MOQ 이상 주문했는데 배송도 빠르고 좋습니다. 리모컨 반응 약간 느림.' },
  { id: '3', user: '박**', rating: 5, date: '2026-03-20', content: '재주문입니다. 변함없이 좋아요. 패키징도 깔끔합니다.' },
];

type TabKey = 'detail' | 'reviews' | 'inquiry';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const product = useMemo(() => {
    return DETAILED_PRODUCTS.find(p => p.id === productId) || DETAILED_PRODUCTS[0];
  }, [productId]);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(product.moq || 10);
  const [activeTab, setActiveTab] = useState<TabKey>('detail');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showOriginalTitle, setShowOriginalTitle] = useState(false);

  const colorOptions = product.optionsKo?.[0];
  const sizeOptions = product.optionsKo?.[1];

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const showToast = useUIStore((s) => s.showToast);

  const handleAddToCart = () => {
    const colorLabel = colorOptions?.valuesKo[selectedColor] || '';
    const sizeLabel = sizeOptions?.valuesKo[selectedSize] || '';
    addToCart({
      productId: product.id,
      productName: product.titleKo,
      shopId: product.shop.id,
      shopName: product.shop.name,
      imageUrl: product.images[0],
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY || 0,
      quantity,
      options: `${colorLabel} / ${sizeLabel}`,
      minOrderQty: product.moq || 10,
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
      productName: product.titleKo,
      imageUrl: product.images[0],
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY || 0,
      category: product.category || '',
      addedAt: new Date().toISOString(),
    });
    showToast(
      isWishlisted ? '찜 목록에서 제거되었습니다' : '찜 목록에 추가되었습니다',
      'success'
    );
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'detail', label: '상세정보' },
    { key: 'reviews', label: `리뷰 (${product.reviewCount || 0})` },
    { key: 'inquiry', label: '문의하기' },
  ];

  return (
    <div className="pb-20">
      {/* Image Gallery */}
      <div className="relative bg-surface-container">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images[currentImage]}
            alt={product.titleKo}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          {currentImage + 1}/{product.images.length}
        </div>
        <div className="flex gap-1 p-2 overflow-x-auto scrollbar-hide">
          {product.images.map((img, i) => (
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
      </div>

      <div className="max-w-3xl mx-auto">
        <ImportDisclaimer />

        {/* Price Section */}
        <div className="px-4 py-4 bg-surface-container-lowest">
          <ProductPrice
            priceKRW={product.priceKRW}
            originalPriceKRW={product.originalPriceKRW}
            priceCNY={product.priceCNY}
            discountPercent={product.discountPercent}
            size="lg"
          />

          {/* Korean title as primary */}
          <div className="mt-3">
            <div className="flex items-start gap-2">
              <h1 className="text-base font-medium text-on-surface leading-snug flex-1">
                {product.titleKo}
              </h1>
              <TranslationBadge
                className="flex-shrink-0 mt-0.5"
                onToggleOriginal={() => setShowOriginalTitle(!showOriginalTitle)}
              />
            </div>
            {showOriginalTitle && (
              <p className="text-xs text-on-surface-variant/60 mt-1.5 leading-snug">
                {product.titleOriginal}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-secondary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-semibold text-on-surface">{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
            <span>|</span>
            <span>누적 {(product.salesCount || 0).toLocaleString()}+ 판매</span>
            <span>|</span>
            <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-medium">
              MOQ {product.moq}{product.unitKo}
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
              <p className="text-xs font-semibold text-on-surface mt-1">배송 {product.deliveryDays}일</p>
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
          priceCny={product.priceCNY || 0}
          quantity={quantity}
          weightKg={product.weightKg}
        />

        {/* Shop Info Card */}
        <div className="mx-4 mt-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container flex-shrink-0">
              <img src={product.shop.logo} alt={product.shop.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-semibold text-on-surface truncate">{product.shop.name}</h4>
                {product.shop.verified && (
                  <span className="material-symbols-outlined text-tertiary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                )}
              </div>
              <p className="text-[10px] text-on-surface-variant mt-0.5">
                {product.shop.location}
                <span className="text-on-surface-variant/40 ml-1">
                  ({product.shop.locationOriginal})
                </span>
              </p>
            </div>
            <Link
              href={`/shop/${product.shop.id}`}
              className="px-3 py-1.5 rounded-full border border-primary text-primary text-xs font-medium hover:bg-primary/5 transition-colors flex-shrink-0"
            >
              상점방문
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-outline-variant/20 text-center">
            <div>
              <p className="text-sm font-bold text-on-surface">{product.shop.products.toLocaleString()}</p>
              <p className="text-[10px] text-on-surface-variant">상품수</p>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">{product.shop.followers.toLocaleString()}</p>
              <p className="text-[10px] text-on-surface-variant">팔로워</p>
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">{product.shop.responseRate}%</p>
              <p className="text-[10px] text-on-surface-variant">응답률</p>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="px-4 mt-4 space-y-4">
          {/* Color - Korean labels */}
          {colorOptions && (
            <div>
              <h3 className="text-sm font-semibold text-on-surface mb-2">
                {colorOptions.labelKo}{' '}
                <span className="text-on-surface-variant font-normal">: {colorOptions.valuesKo[selectedColor]}</span>
              </h3>
              <div className="flex gap-2">
                {colorOptions.valuesKo.map((color, i) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(i)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border transition-colors',
                      i === selectedColor
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/50'
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size - Korean labels with size guide */}
          {sizeOptions && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-on-surface">{sizeOptions.labelKo}</h3>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-[11px] text-primary font-medium flex items-center gap-0.5 hover:underline"
                >
                  <span className="material-symbols-outlined text-[14px]">straighten</span>
                  사이즈 가이드
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.valuesKo.map((size, i) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(i)}
                    className={cn(
                      'py-2.5 rounded-lg text-sm font-medium border text-center transition-colors',
                      i === selectedSize
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-outline-variant/40 text-on-surface-variant hover:border-primary/50'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">
              수량{' '}
              <span className="text-[10px] font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">
                MOQ {product.moq}{product.unitKo}
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 10))}
                className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || (product.moq || 1);
                  setQuantity(Math.max(product.moq || 1, val));
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
                합계 <span className="font-bold text-primary">{(product.priceKRW * quantity).toLocaleString()}원</span>
              </span>
            </div>
          </div>
        </div>

        {/* Specs Table - Korean */}
        {product.specsKo && product.specsKo.length > 0 && (
          <div className="mx-4 mt-4 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20">
            <h3 className="text-sm font-semibold text-on-surface mb-3">상품 사양</h3>
            <div className="space-y-2">
              {product.specsKo.map((spec, i) => (
                <div key={i} className="flex items-center py-1.5 border-b border-outline-variant/10 last:border-0">
                  <span className="text-xs text-on-surface-variant w-24 flex-shrink-0">{spec.keyKo}</span>
                  <span className="text-xs font-medium text-on-surface">{spec.valueKo}</span>
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
                {/* Korean description with toggle to original */}
                <TranslationToggle
                  originalText={product.descOriginal}
                  translatedText={product.descKo}
                  textClassName="text-sm leading-relaxed"
                />
                <div className="mt-4 space-y-2">
                  {product.images.slice(2, 6).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`상세이미지 ${i + 1}`}
                      className="w-full rounded-lg"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-heading font-black text-on-surface">{product.rating}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={cn(
                            'material-symbols-outlined text-[16px]',
                            star <= Math.round(product.rating || 0)
                              ? 'text-secondary-container'
                              : 'text-stone-300'
                          )}
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">{product.reviewCount}개 리뷰</p>
                  </div>
                </div>

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
        type={product.category === '신발' ? 'shoes' : 'clothing'}
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
