/**
 * Comprehensive mock data for standalone demo mode.
 * Used by api-client mock interceptors when no real API is available.
 */

import type { Product } from '@/components/product/ProductCard';

// --- Exchange Rate ---
export const MOCK_EXCHANGE_RATE = {
  rate: 186.42,
  change: 0.52,
  changePercent: 0.28,
  updatedAt: new Date().toISOString(),
  baseCurrency: 'CNY',
  targetCurrency: 'KRW',
};

// --- Categories (26 Yiwu categories) ---
export const MOCK_CATEGORIES = [
  { code: '01', nameZh: '玩具', nameKo: '완구', icon: '🧸', slug: 'toys', productCount: 84200 },
  { code: '02', nameZh: '工艺品', nameKo: '공예품', icon: '🏺', slug: 'crafts', productCount: 62100 },
  { code: '03', nameZh: '饰品', nameKo: '액세서리', icon: '💍', slug: 'accessories', productCount: 154300 },
  { code: '04', nameZh: '箱包', nameKo: '가방', icon: '👜', slug: 'bags', productCount: 95800 },
  { code: '05', nameZh: '服装', nameKo: '의류', icon: '👕', slug: 'apparel', productCount: 210500 },
  { code: '06', nameZh: '内衣', nameKo: '속옷', icon: '👙', slug: 'underwear', productCount: 43200 },
  { code: '07', nameZh: '袜子', nameKo: '양말', icon: '🧦', slug: 'socks', productCount: 28700 },
  { code: '08', nameZh: '鞋子', nameKo: '신발', icon: '👟', slug: 'shoes', productCount: 76400 },
  { code: '09', nameZh: '帽子', nameKo: '모자', icon: '🧢', slug: 'hats', productCount: 31900 },
  { code: '10', nameZh: '围巾', nameKo: '스카프', icon: '🧣', slug: 'scarves', productCount: 18500 },
  { code: '11', nameZh: '皮带', nameKo: '벨트', icon: '🪢', slug: 'belts', productCount: 15200 },
  { code: '12', nameZh: '眼镜', nameKo: '안경', icon: '👓', slug: 'glasses', productCount: 22800 },
  { code: '13', nameZh: '钟表', nameKo: '시계', icon: '⌚', slug: 'watches', productCount: 35600 },
  { code: '14', nameZh: '珠宝', nameKo: '보석', icon: '💎', slug: 'jewelry', productCount: 47300 },
  { code: '15', nameZh: '厨房用品', nameKo: '주방', icon: '🍳', slug: 'kitchen', productCount: 89100 },
  { code: '16', nameZh: '日用百货', nameKo: '일용품', icon: '🧴', slug: 'daily', productCount: 132400 },
  { code: '17', nameZh: '文具', nameKo: '문구', icon: '✏️', slug: 'stationery', productCount: 67800 },
  { code: '18', nameZh: '办公用品', nameKo: '사무', icon: '🖨️', slug: 'office', productCount: 41500 },
  { code: '19', nameZh: '体育用品', nameKo: '체육', icon: '⚽', slug: 'sports', productCount: 53200 },
  { code: '20', nameZh: '电子产品', nameKo: '전자', icon: '📱', slug: 'electronics', productCount: 178900 },
  { code: '21', nameZh: '化妆品', nameKo: '화장품', icon: '💄', slug: 'cosmetics', productCount: 62700 },
  { code: '22', nameZh: '家居装饰', nameKo: '인테리어', icon: '🛋️', slug: 'interior', productCount: 94500 },
  { code: '23', nameZh: '灯饰', nameKo: '조명', icon: '💡', slug: 'lighting', productCount: 38400 },
  { code: '24', nameZh: '包装用品', nameKo: '포장', icon: '📦', slug: 'packaging', productCount: 27600 },
  { code: '25', nameZh: '汽车用品', nameKo: '오토', icon: '🚗', slug: 'auto', productCount: 45100 },
  { code: '26', nameZh: '五金工具', nameKo: '철물', icon: '🔧', slug: 'hardware', productCount: 58300 },
];

// --- Products ---
const PRODUCT_NAMES = [
  'LED 무드등 감성 조명 인테리어 램프',
  '실리콘 주방용품 세트 논슬립 조리도구',
  'USB-C 멀티 허브 7in1 HDMI 어댑터',
  '스테인리스 텀블러 500ml 보온보냉',
  '무선 블루투스 이어폰 노이즈캔슬링',
  '접이식 캠핑 테이블 경량 알루미늄',
  '다이캐스팅 냄비 세트 IH 인덕션 호환',
  '에코백 캔버스 장바구니 대용량',
  '스마트워치 밴드 실리콘 교체용',
  '미니 가습기 USB 초음파 무소음',
  '요가 매트 TPE 6mm 미끄럼방지',
  'LED 스탠드 조명 터치 밝기조절',
  '자동차 핸드폰 거치대 에어컨 송풍구',
  '폴딩 우산 자동 3단 방풍 우산',
  '실리콘 주방장갑 내열 오븐장갑',
  '미니 선풍기 USB 탁상용 저소음',
];

const PRODUCT_CATEGORIES = ['리빙/주방', '디지털', '스포츠', '패션', '뷰티'];
const PRODUCT_BADGES: Array<Product['badge']> = ['TOP', 'SALE', 'HOT', 'NEW', null];
const SHOP_NAMES = [
  '금영무역', '대화상사', '한중통상', '동방교역', '신성무역',
  '우진상사', '광명글로벌', '서울트레이딩', '부산수출', '인천글로벌',
];

export function generateMockProduct(id: number, badge?: Product['badge']): Product {
  const priceKRW = 2000 + ((id * 3571) % 48000);
  const priceCNY = Math.round(priceKRW / MOCK_EXCHANGE_RATE.rate);
  const hasSale = badge === 'SALE' || id % 5 === 0;
  return {
    id: `prod-${id}`,
    name: PRODUCT_NAMES[id % PRODUCT_NAMES.length],
    imageUrl: `https://picsum.photos/seed/yiwu${id}/400/400`,
    category: PRODUCT_CATEGORIES[id % PRODUCT_CATEGORIES.length],
    priceKRW,
    originalPriceKRW: hasSale ? Math.floor(priceKRW * 1.3) : undefined,
    priceCNY,
    discountPercent: hasSale ? 30 : undefined,
    moq: [5, 10, 20, 50, 100][id % 5],
    salesCount: (id * 997) % 8000,
    badge: badge ?? PRODUCT_BADGES[id % PRODUCT_BADGES.length] ?? null,
    shopName: SHOP_NAMES[id % SHOP_NAMES.length],
    rating: 3.5 + (id % 15) / 10,
    reviewCount: (id * 73) % 500,
  };
}

export const MOCK_PRODUCTS: Product[] = Array.from({ length: 16 }, (_, i) =>
  generateMockProduct(i)
);

// --- Orders ---
export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'SOURCING'
  | 'INSPECTING'
  | 'SHIPPING_INTERNATIONAL'
  | 'CUSTOMS'
  | 'SHIPPING_DOMESTIC'
  | 'DELIVERED'
  | 'CANCELLED';

export interface MockOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  statusLabel: string;
  items: Array<{
    productId: string;
    productName: string;
    imageUrl: string;
    quantity: number;
    priceKRW: number;
  }>;
  totalKRW: number;
  totalCNY: number;
  shippingMethod: '항공' | '해운';
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'YK-2026-001542',
    status: 'SHIPPING_INTERNATIONAL',
    statusLabel: '국제배송중',
    items: [
      { productId: 'prod-0', productName: 'LED 무드등 감성 조명 인테리어 램프', imageUrl: 'https://picsum.photos/seed/yiwu0/400/400', quantity: 100, priceKRW: 5200 },
      { productId: 'prod-2', productName: 'USB-C 멀티 허브 7in1 HDMI 어댑터', imageUrl: 'https://picsum.photos/seed/yiwu2/400/400', quantity: 50, priceKRW: 12800 },
    ],
    totalKRW: 1160000,
    totalCNY: 6224,
    shippingMethod: '항공',
    createdAt: '2026-04-02T09:15:00Z',
    estimatedDelivery: '2026-04-15',
    trackingNumber: 'SF1234567890',
  },
  {
    id: 'ord-2',
    orderNumber: 'YK-2026-001538',
    status: 'INSPECTING',
    statusLabel: '검수중',
    items: [
      { productId: 'prod-6', productName: '다이캐스팅 냄비 세트 IH 인덕션 호환', imageUrl: 'https://picsum.photos/seed/yiwu6/400/400', quantity: 30, priceKRW: 28500 },
    ],
    totalKRW: 855000,
    totalCNY: 4587,
    shippingMethod: '해운',
    createdAt: '2026-04-05T14:30:00Z',
    estimatedDelivery: '2026-04-28',
  },
  {
    id: 'ord-3',
    orderNumber: 'YK-2026-001520',
    status: 'DELIVERED',
    statusLabel: '배송완료',
    items: [
      { productId: 'prod-4', productName: '무선 블루투스 이어폰 노이즈캔슬링', imageUrl: 'https://picsum.photos/seed/yiwu4/400/400', quantity: 200, priceKRW: 8900 },
      { productId: 'prod-9', productName: '미니 가습기 USB 초음파 무소음', imageUrl: 'https://picsum.photos/seed/yiwu9/400/400', quantity: 100, priceKRW: 6200 },
    ],
    totalKRW: 2400000,
    totalCNY: 12874,
    shippingMethod: '항공',
    createdAt: '2026-03-20T11:00:00Z',
    estimatedDelivery: '2026-04-03',
    trackingNumber: 'CJ1234567890',
  },
  {
    id: 'ord-4',
    orderNumber: 'YK-2026-001510',
    status: 'CANCELLED',
    statusLabel: '주문취소',
    items: [
      { productId: 'prod-14', productName: '실리콘 주방장갑 내열 오븐장갑', imageUrl: 'https://picsum.photos/seed/yiwu14/400/400', quantity: 500, priceKRW: 2800 },
    ],
    totalKRW: 1400000,
    totalCNY: 7511,
    shippingMethod: '해운',
    createdAt: '2026-03-15T08:45:00Z',
    estimatedDelivery: '2026-04-10',
  },
  {
    id: 'ord-5',
    orderNumber: 'YK-2026-001555',
    status: 'PAID',
    statusLabel: '결제완료',
    items: [
      { productId: 'prod-10', productName: '요가 매트 TPE 6mm 미끄럼방지', imageUrl: 'https://picsum.photos/seed/yiwu10/400/400', quantity: 80, priceKRW: 9500 },
    ],
    totalKRW: 760000,
    totalCNY: 4077,
    shippingMethod: '항공',
    createdAt: '2026-04-09T16:20:00Z',
    estimatedDelivery: '2026-04-22',
  },
];

// --- User Profile ---
export const MOCK_USER = {
  id: 'user-demo-001',
  email: 'demo@yiwugo.kr',
  name: '김소싱',
  phone: '010-1234-5678',
  businessName: '소싱매니아',
  businessNumber: '123-45-67890',
  role: 'USER' as const,
  tier: 'GOLD' as const,
  points: 12500,
  orderCount: 47,
  totalSpent: 28450000,
  createdAt: '2025-06-15T00:00:00Z',
  profileImageUrl: 'https://picsum.photos/seed/user1/200/200',
  address: {
    zipCode: '06234',
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '소싱빌딩 4층',
  },
};

// --- Notifications ---
export const MOCK_NOTIFICATIONS = [
  {
    id: 'noti-1',
    type: 'ORDER' as const,
    title: '주문 배송 시작',
    message: 'YK-2026-001542 주문이 국제배송을 시작했습니다.',
    isRead: false,
    createdAt: '2026-04-09T10:00:00Z',
    link: '/orders/ord-1',
  },
  {
    id: 'noti-2',
    type: 'PRICE' as const,
    title: '관심상품 가격 인하',
    message: 'LED 무드등 감성 조명의 가격이 15% 인하되었습니다.',
    isRead: false,
    createdAt: '2026-04-08T14:30:00Z',
    link: '/product/prod-0',
  },
  {
    id: 'noti-3',
    type: 'SYSTEM' as const,
    title: '환율 알림',
    message: 'CNY/KRW 환율이 186.42원으로 변동되었습니다.',
    isRead: true,
    createdAt: '2026-04-07T09:00:00Z',
  },
  {
    id: 'noti-4',
    type: 'ORDER' as const,
    title: '배송 완료',
    message: 'YK-2026-001520 주문이 배송 완료되었습니다.',
    isRead: true,
    createdAt: '2026-04-03T16:00:00Z',
    link: '/orders/ord-3',
  },
  {
    id: 'noti-5',
    type: 'PROMO' as const,
    title: '봄 세일 시작!',
    message: '인기 카테고리 최대 60% 할인 이벤트가 시작됩니다.',
    isRead: true,
    createdAt: '2026-04-01T00:00:00Z',
    link: '/category/living',
  },
];

// --- Reviews ---
export const MOCK_REVIEWS = [
  {
    id: 'rev-1',
    productId: 'prod-0',
    productName: 'LED 무드등 감성 조명 인테리어 램프',
    rating: 5,
    content: '품질이 정말 좋습니다. MOQ도 적어서 소량 테스트하기 좋았어요. 재주문 예정입니다.',
    images: ['https://picsum.photos/seed/rev1a/300/300', 'https://picsum.photos/seed/rev1b/300/300'],
    userName: '김바이어',
    createdAt: '2026-04-05T12:00:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-4',
    productName: '무선 블루투스 이어폰 노이즈캔슬링',
    rating: 4,
    content: '배송이 빠르고 검수 서비스가 꼼꼼했습니다. 불량률도 거의 없었어요.',
    images: [],
    userName: '이도매',
    createdAt: '2026-04-02T08:30:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-6',
    productName: '다이캐스팅 냄비 세트 IH 인덕션 호환',
    rating: 5,
    content: '이우 현지 가격 그대로 한국에서 구매할 수 있어서 매우 만족합니다.',
    images: ['https://picsum.photos/seed/rev3a/300/300'],
    userName: '박소싱',
    createdAt: '2026-03-28T15:00:00Z',
  },
];

// --- Banners ---
export const MOCK_BANNERS = [
  {
    id: 'banner-1',
    title: '봄맞이 생활용품 특가전',
    subtitle: '최대 60% 할인 + 무료배송',
    gradient: 'from-primary to-primary-container',
    link: '/category/living',
    imageUrl: 'https://picsum.photos/seed/banner1/1200/400',
  },
  {
    id: 'banner-2',
    title: '디지털 액세서리 대전',
    subtitle: '인기 전자제품 MOQ 50개부터',
    gradient: 'from-tertiary to-tertiary-container',
    link: '/category/digital',
    imageUrl: 'https://picsum.photos/seed/banner2/1200/400',
  },
  {
    id: 'banner-3',
    title: '여름 패션 사전예약',
    subtitle: '트렌디한 의류 소싱 찬스',
    gradient: 'from-secondary to-secondary-container',
    link: '/category/fashion',
    imageUrl: 'https://picsum.photos/seed/banner3/1200/400',
  },
];

// --- Shops ---
export const MOCK_SHOPS = [
  {
    id: 'shop-1',
    nameKo: '금영무역',
    nameOriginal: '金英贸易',
    boothNumber: 'A-1-2345',
    logoUrl: 'https://picsum.photos/seed/shop1/200/200',
    productCount: 356,
    responseRate: 98,
    yearsInBusiness: 12,
    isVerified: true,
    rating: 4.8,
    categories: ['전자', '조명'],
  },
  {
    id: 'shop-2',
    nameKo: '대화상사',
    nameOriginal: '大华商社',
    boothNumber: 'B-3-1567',
    logoUrl: 'https://picsum.photos/seed/shop2/200/200',
    productCount: 892,
    responseRate: 95,
    yearsInBusiness: 8,
    isVerified: true,
    rating: 4.6,
    categories: ['주방', '일용품'],
  },
  {
    id: 'shop-3',
    nameKo: '한중통상',
    nameOriginal: '韩中通商',
    boothNumber: 'C-2-0891',
    logoUrl: 'https://picsum.photos/seed/shop3/200/200',
    productCount: 1245,
    responseRate: 92,
    yearsInBusiness: 15,
    isVerified: true,
    rating: 4.9,
    categories: ['의류', '가방', '액세서리'],
  },
];

// --- Notices ---
export const MOCK_NOTICES = [
  {
    id: 'notice-1',
    title: '2026년 봄 정기 점검 안내',
    content: '4월 15일(화) 02:00 ~ 06:00 정기 서버 점검이 예정되어 있습니다.',
    category: '공지',
    createdAt: '2026-04-08T00:00:00Z',
    isPinned: true,
  },
  {
    id: 'notice-2',
    title: '해운 배송 일정 변경 안내',
    content: '중국 국경절 연휴로 인해 해운 배송 일정이 변경됩니다.',
    category: '배송',
    createdAt: '2026-04-05T00:00:00Z',
    isPinned: false,
  },
  {
    id: 'notice-3',
    title: '환율 수수료 인하 안내',
    content: '4월 한 달간 환율 마진이 1.0%로 인하됩니다.',
    category: '이벤트',
    createdAt: '2026-04-01T00:00:00Z',
    isPinned: false,
  },
];
