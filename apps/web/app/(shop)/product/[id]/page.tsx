'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import ProductPrice from '@/components/product/ProductPrice';
import { useCartStore } from '@/stores/cart-store';
import { useWishlistStore } from '@/stores/wishlist-store';
import { useUIStore } from '@/stores/ui-store';

// --- Mock Data ---
const MOCK_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'LED 무드등 감성 조명 RGB 인테리어 수면등 침실 취침등 리모컨 포함',
    images: Array.from({ length: 8 }, (_, i) => `https://picsum.photos/seed/detail${i}/600/600`),
    category: '리빙/주방',
    priceKRW: 12500,
    originalPriceKRW: 18000,
    priceCNY: 65.79,
    discountPercent: 31,
    moq: 20,
    rating: 4.6,
    reviewCount: 328,
    salesCount: 5840,
    colors: ['화이트', '블랙', '우드', '핑크'],
    sizes: ['S (15cm)', 'M (20cm)', 'L (25cm)'],
    deliveryDays: '7~12',
    shop: {
      id: 'shop-1',
      name: 'YiwuLED Official Store',
      logo: 'https://picsum.photos/seed/shop1/100/100',
      verified: true,
      location: '이우시 푸톈구',
      responseRate: 98,
      products: 1240,
      followers: 3560,
    },
    description: `
      <p>고품질 LED 무드등으로 감성 인테리어를 완성하세요.</p>
      <ul>
        <li>RGB 16색 변환</li>
        <li>리모컨 제어 + 터치 제어</li>
        <li>USB 충전식 (2시간 충전, 8시간 사용)</li>
        <li>IP65 방수 등급</li>
        <li>무게: 250g</li>
      </ul>
    `,
  },
  {
    id: 'prod-2',
    name: '실리콘 주방용품 세트 12종 논슬립 내열 조리도구',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/kitchen${i}/600/600`),
    category: '리빙/주방',
    priceKRW: 8900,
    originalPriceKRW: 12000,
    priceCNY: 46.84,
    discountPercent: 26,
    moq: 10,
    rating: 4.4,
    reviewCount: 156,
    salesCount: 3200,
    colors: ['그린', '핑크', '그레이'],
    sizes: ['12종 세트', '6종 세트'],
    deliveryDays: '7~10',
    shop: {
      id: 'shop-2',
      name: '이우 키친웨어',
      logo: 'https://picsum.photos/seed/shop2/100/100',
      verified: true,
      location: '이우시 궈제상마오청',
      responseRate: 95,
      products: 860,
      followers: 2100,
    },
    description: `
      <p>내열 실리콘 소재로 안전한 주방용품 세트입니다.</p>
      <ul>
        <li>내열 온도: 230도</li>
        <li>FDA 인증 식품 등급 실리콘</li>
        <li>논슬립 손잡이</li>
        <li>식기세척기 사용 가능</li>
      </ul>
    `,
  },
  {
    id: 'prod-3',
    name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터 맥북 프로 호환',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/hub${i}/600/600`),
    category: '디지털',
    priceKRW: 18900,
    originalPriceKRW: 25000,
    priceCNY: 99.47,
    discountPercent: 24,
    moq: 50,
    rating: 4.7,
    reviewCount: 412,
    salesCount: 8920,
    colors: ['실버', '스페이스그레이'],
    sizes: ['7포트', '5포트'],
    deliveryDays: '5~8',
    shop: {
      id: 'shop-3',
      name: '광저우 디지털 마트',
      logo: 'https://picsum.photos/seed/shop3/100/100',
      verified: true,
      location: '광저우시 텐허구',
      responseRate: 99,
      products: 2340,
      followers: 5800,
    },
    description: `
      <p>7-in-1 USB-C 멀티 허브로 생산성을 높이세요.</p>
      <ul>
        <li>4K HDMI 출력</li>
        <li>USB 3.0 x 3</li>
        <li>SD/TF 카드 리더</li>
        <li>PD 100W 충전</li>
      </ul>
    `,
  },
];

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
    return MOCK_PRODUCTS.find(p => p.id === productId) || MOCK_PRODUCTS[0];
  }, [productId]);

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(product.moq);
  const [activeTab, setActiveTab] = useState<TabKey>('detail');

  const addToCart = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product.id));
  const showToast = useUIStore((s) => s.showToast);

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      shopId: product.shop.id,
      shopName: product.shop.name,
      imageUrl: product.images[0],
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY,
      quantity,
      options: `${product.colors[selectedColor]} / ${product.sizes[selectedSize]}`,
      minOrderQty: product.moq,
    });
    showToast('장바구니에 추가되었습니다', 'success');
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      shopId: product.shop.id,
      shopName: product.shop.name,
      imageUrl: product.images[0],
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY,
      quantity,
      options: `${product.colors[selectedColor]} / ${product.sizes[selectedSize]}`,
      minOrderQty: product.moq,
    });
    router.push('/checkout');
  };

  const handleToggleWishlist = () => {
    toggleWishlist({
      productId: product.id,
      productName: product.name,
      imageUrl: product.images[0],
      priceKrw: product.priceKRW,
      priceCny: product.priceCNY,
      category: product.category,
      addedAt: new Date().toISOString(),
    });
    showToast(
      isWishlisted ? '찜 목록에서 제거되었습니다' : '찜 목록에 추가되었습니다',
      'success'
    );
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'detail', label: '상세정보' },
    { key: 'reviews', label: `리뷰 (${product.reviewCount})` },
    { key: 'inquiry', label: '문의하기' },
  ];

  return (
    <div className="pb-20">
      {/* Image Gallery */}
      <div className="relative bg-surface-container">
        <div className="aspect-square overflow-hidden">
          <img
            src={product.images[currentImage]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
          {currentImage + 1}/{product.images.length}
        </div>
        {/* Thumbnail strip */}
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
        {/* Price Section */}
        <div className="px-4 py-4 bg-surface-container-lowest">
          <ProductPrice
            priceKRW={product.priceKRW}
            originalPriceKRW={product.originalPriceKRW}
            priceCNY={product.priceCNY}
            discountPercent={product.discountPercent}
            size="lg"
          />
          <h1 className="text-base font-medium text-on-surface mt-3 leading-snug">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
            <div className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-secondary-container text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              <span className="font-semibold text-on-surface">{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
            <span>|</span>
            <span>판매 {product.salesCount.toLocaleString()}개</span>
            <span>|</span>
            <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-medium">
              MOQ {product.moq}개
            </span>
          </div>
        </div>

        {/* Shipping & Logistics Card */}
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

        {/* Store Info Card */}
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
              <p className="text-[10px] text-on-surface-variant mt-0.5">{product.shop.location}</p>
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
          {/* Color */}
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">
              색상 <span className="text-on-surface-variant font-normal">: {product.colors[selectedColor]}</span>
            </h3>
            <div className="flex gap-2">
              {product.colors.map((color, i) => (
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

          {/* Size */}
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">사이즈</h3>
            <div className="grid grid-cols-3 gap-2">
              {product.sizes.map((size, i) => (
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

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">
              수량{' '}
              <span className="text-[10px] font-normal text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded ml-1">
                MOQ {product.moq}개
              </span>
            </h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(product.moq, quantity - 10))}
                className="w-9 h-9 rounded-lg border border-outline-variant/40 flex items-center justify-center hover:border-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">remove</span>
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || product.moq;
                  setQuantity(Math.max(product.moq, val));
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
              <div className="prose prose-sm max-w-none text-on-surface">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
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
                {/* Rating summary */}
                <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-heading font-black text-on-surface">{product.rating}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={cn(
                            'material-symbols-outlined text-[16px]',
                            star <= Math.round(product.rating)
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

                {/* Reviews list */}
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
