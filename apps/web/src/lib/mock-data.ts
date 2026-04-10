/**
 * Comprehensive mock data for standalone demo mode.
 * Demonstrates full Chinese → Korean translation pipeline.
 * Every product has original Chinese + natural Korean translations.
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

// --- Enhanced Product Data with Full Translation Pipeline ---

export interface TranslatedOption {
  labelOriginal: string;
  labelKo: string;
  valuesOriginal: string[];
  valuesKo: string[];
}

export interface TranslatedSpec {
  keyOriginal: string;
  keyKo: string;
  valueOriginal: string;
  valueKo: string;
}

export interface DetailedProduct extends Product {
  // Translation pairs
  titleOriginal: string;
  titleKo: string;
  descOriginal: string;
  descKo: string;
  optionsOriginal: TranslatedOption[];
  optionsKo: TranslatedOption[];
  specsOriginal: TranslatedSpec[];
  specsKo: TranslatedSpec[];
  shopNameOriginal: string;
  shopNameKo: string;
  unitOriginal: string;
  unitKo: string;
  // Extra detail fields
  images: string[];
  weightKg: number;
  deliveryDays: string;
  shop: {
    id: string;
    name: string;
    nameOriginal: string;
    logo: string;
    verified: boolean;
    location: string;
    locationOriginal: string;
    responseRate: number;
    products: number;
    followers: number;
    descriptionOriginal: string;
    descriptionKo: string;
  };
}

export const DETAILED_PRODUCTS: DetailedProduct[] = [
  // 1. 운동화/신발
  {
    id: 'prod-1',
    name: '2024 신상 경량 메쉬 운동화 남녀공용 캐주얼 러닝화',
    titleOriginal: '2024新款轻便透气网面运动鞋男女通用休闲跑步鞋',
    titleKo: '2024 신상 경량 메쉬 운동화 남녀공용 캐주얼 러닝화',
    imageUrl: 'https://picsum.photos/seed/shoe1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/shoe1d${i}/600/600`),
    category: '신발',
    priceKRW: 16800,
    originalPriceKRW: 22000,
    priceCNY: 89,
    discountPercent: 24,
    moq: 10,
    salesCount: 4520,
    badge: 'HOT' as const,
    rating: 4.7,
    reviewCount: 286,
    weightKg: 0.6,
    deliveryDays: '7~12',
    descOriginal: '采用高品质网面材料，轻便透气，适合日常运动和休闲穿着。橡胶大底防滑耐磨，EVA中底轻量缓震。鞋头加固设计，耐穿不易破损。',
    descKo: '고품질 메쉬 소재로 가볍고 통기성이 뛰어나 데일리 운동 및 캐주얼 착용에 적합합니다. 고무 아웃솔로 미끄럼 방지, EVA 미드솔로 가벼운 쿠셔닝을 제공합니다. 발끝 보강 설계로 내구성이 우수합니다.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '白色', '灰色', '蓝色'], valuesKo: ['블랙', '화이트', '그레이', '블루'] },
      { labelOriginal: '尺码', labelKo: '사이즈', valuesOriginal: ['39', '40', '41', '42', '43', '44'], valuesKo: ['245mm', '250mm', '255mm', '260mm', '270mm', '280mm'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '白色', '灰色', '蓝色'], valuesKo: ['블랙', '화이트', '그레이', '블루'] },
      { labelOriginal: '尺码', labelKo: '사이즈', valuesOriginal: ['39', '40', '41', '42', '43', '44'], valuesKo: ['245mm', '250mm', '255mm', '260mm', '270mm', '280mm'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '网面+PU', valueKo: '메쉬+PU' },
      { keyOriginal: '鞋底', keyKo: '밑창', valueOriginal: '橡胶', valueKo: '고무' },
      { keyOriginal: '中底', keyKo: '중창', valueOriginal: 'EVA', valueKo: 'EVA' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约300克/只', valueKo: '약 300g/짝' },
      { keyOriginal: '适用季节', keyKo: '적용 시즌', valueOriginal: '春秋夏', valueKo: '봄/여름/가을' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '网面+PU', valueKo: '메쉬+PU' },
      { keyOriginal: '鞋底', keyKo: '밑창', valueOriginal: '橡胶', valueKo: '고무' },
      { keyOriginal: '中底', keyKo: '중창', valueOriginal: 'EVA', valueKo: 'EVA' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约300克/只', valueKo: '약 300g/짝' },
      { keyOriginal: '适用季节', keyKo: '적용 시즌', valueOriginal: '春秋夏', valueKo: '봄/여름/가을' },
    ],
    shopNameOriginal: '义乌市飞越鞋业有限公司',
    shopNameKo: '이우 페이위에 슈즈',
    unitOriginal: '双',
    unitKo: '켤레',
    shopName: '이우 페이위에 슈즈',
    shop: {
      id: 'shop-1',
      name: '이우 페이위에 슈즈',
      nameOriginal: '义乌市飞越鞋业有限公司',
      logo: 'https://picsum.photos/seed/shopshoe/100/100',
      verified: true,
      location: '이우시 푸톈구 3구역 2층',
      locationOriginal: '义乌市福田区三区二楼',
      responseRate: 97,
      products: 860,
      followers: 2340,
      descriptionOriginal: '专业运动鞋生产厂家，15年生产经验，支持OEM/ODM定制。',
      descriptionKo: '운동화 전문 생산업체, 15년 생산 경력, OEM/ODM 맞춤 제작 가능.',
    },
  },
  // 2. LED 조명
  {
    id: 'prod-2',
    name: 'LED 무드등 RGB 감성 조명 리모컨 포함 인테리어 수면등',
    titleOriginal: 'LED氛围灯RGB遥控器彩色装饰灯卧室床头小夜灯',
    titleKo: 'LED 무드등 RGB 감성 조명 리모컨 포함 인테리어 수면등',
    imageUrl: 'https://picsum.photos/seed/led1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/led1d${i}/600/600`),
    category: '조명',
    priceKRW: 5600,
    originalPriceKRW: 7500,
    priceCNY: 29.9,
    discountPercent: 25,
    moq: 50,
    salesCount: 12800,
    badge: 'TOP' as const,
    rating: 4.8,
    reviewCount: 542,
    weightKg: 0.25,
    deliveryDays: '7~10',
    descOriginal: '16色RGB变色LED氛围灯，配备遥控器，支持亮度调节和定时功能。USB充电，续航8小时。IP65防水，室内外皆可使用。',
    descKo: '16색 RGB 컬러 LED 무드등으로 리모컨 포함, 밝기 조절 및 타이머 기능을 지원합니다. USB 충전식으로 8시간 연속 사용 가능. IP65 방수 등급으로 실내외 모두 사용 가능합니다.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['白色外壳', '黑色外壳', '木纹'], valuesKo: ['화이트', '블랙', '우드'] },
      { labelOriginal: '尺寸', labelKo: '사이즈', valuesOriginal: ['小号(15cm)', '中号(20cm)', '大号(25cm)'], valuesKo: ['S (15cm)', 'M (20cm)', 'L (25cm)'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['白色外壳', '黑色外壳', '木纹'], valuesKo: ['화이트', '블랙', '우드'] },
      { labelOriginal: '尺寸', labelKo: '사이즈', valuesOriginal: ['小号(15cm)', '中号(20cm)', '大号(25cm)'], valuesKo: ['S (15cm)', 'M (20cm)', 'L (25cm)'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: 'ABS+硅胶', valueKo: 'ABS+실리콘' },
      { keyOriginal: '光源', keyKo: '광원', valueOriginal: 'LED RGB', valueKo: 'LED RGB' },
      { keyOriginal: '防水等级', keyKo: '방수등급', valueOriginal: 'IP65', valueKo: 'IP65' },
      { keyOriginal: '充电方式', keyKo: '충전방식', valueOriginal: 'USB充电', valueKo: 'USB 충전' },
      { keyOriginal: '续航时间', keyKo: '사용시간', valueOriginal: '约8小时', valueKo: '약 8시간' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: 'ABS+硅胶', valueKo: 'ABS+실리콘' },
      { keyOriginal: '光源', keyKo: '광원', valueOriginal: 'LED RGB', valueKo: 'LED RGB' },
      { keyOriginal: '防水等级', keyKo: '방수등급', valueOriginal: 'IP65', valueKo: 'IP65' },
      { keyOriginal: '充电方式', keyKo: '충전방식', valueOriginal: 'USB充电', valueKo: 'USB 충전' },
      { keyOriginal: '续航时间', keyKo: '사용시간', valueOriginal: '约8小时', valueKo: '약 8시간' },
    ],
    shopNameOriginal: '金英贸易有限公司',
    shopNameKo: '금영무역',
    unitOriginal: '个',
    unitKo: '개',
    shopName: '금영무역',
    shop: {
      id: 'shop-2',
      name: '금영무역',
      nameOriginal: '金英贸易有限公司',
      logo: 'https://picsum.photos/seed/shopled/100/100',
      verified: true,
      location: '이우시 푸톈구 4구역 3층',
      locationOriginal: '义乌市福田区四区三楼',
      responseRate: 98,
      products: 1240,
      followers: 3560,
      descriptionOriginal: '义乌最大LED灯饰批发商，15年以上经验，品质保证。',
      descriptionKo: '이우 최대 LED 조명 도매 업체, 15년 이상 경력, 품질 보장.',
    },
  },
  // 3. 가방/백팩
  {
    id: 'prod-3',
    name: '대용량 방수 비즈니스 백팩 USB 충전 포트 노트북 수납',
    titleOriginal: '大容量防水商务双肩包USB充电口笔记本电脑背包男',
    titleKo: '대용량 방수 비즈니스 백팩 USB 충전 포트 노트북 수납',
    imageUrl: 'https://picsum.photos/seed/bag1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/bag1d${i}/600/600`),
    category: '가방',
    priceKRW: 14900,
    originalPriceKRW: 19900,
    priceCNY: 79,
    discountPercent: 25,
    moq: 20,
    salesCount: 3850,
    badge: 'SALE' as const,
    rating: 4.5,
    reviewCount: 198,
    weightKg: 0.8,
    deliveryDays: '7~10',
    descOriginal: '高密度防水牛津布面料，大容量设计可容纳15.6寸笔记本电脑。外置USB充电接口，多层收纳分区，背部透气网面设计。',
    descKo: '고밀도 방수 옥스포드 원단으로 15.6인치 노트북 수납이 가능한 대용량 설계입니다. 외장 USB 충전 포트, 다층 수납 파티션, 등판 통기성 메쉬 설계를 갖추고 있습니다.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '深蓝色', '灰色'], valuesKo: ['블랙', '네이비', '그레이'] },
      { labelOriginal: '容量', labelKo: '용량', valuesOriginal: ['标准款(30L)', '加大款(40L)'], valuesKo: ['기본형 (30L)', '대형 (40L)'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '深蓝色', '灰色'], valuesKo: ['블랙', '네이비', '그레이'] },
      { labelOriginal: '容量', labelKo: '용량', valuesOriginal: ['标准款(30L)', '加大款(40L)'], valuesKo: ['기본형 (30L)', '대형 (40L)'] },
    ],
    specsOriginal: [
      { keyOriginal: '面料', keyKo: '원단', valueOriginal: '防水牛津布', valueKo: '방수 옥스포드' },
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: '30x18x45cm', valueKo: '30x18x45cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约800克', valueKo: '약 800g' },
      { keyOriginal: '适用电脑', keyKo: '호환 노트북', valueOriginal: '15.6寸及以下', valueKo: '15.6인치 이하' },
    ],
    specsKo: [
      { keyOriginal: '面料', keyKo: '원단', valueOriginal: '防水牛津布', valueKo: '방수 옥스포드' },
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: '30x18x45cm', valueKo: '30x18x45cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约800克', valueKo: '약 800g' },
      { keyOriginal: '适用电脑', keyKo: '호환 노트북', valueOriginal: '15.6寸及以下', valueKo: '15.6인치 이하' },
    ],
    shopNameOriginal: '义乌市恒达箱包有限公司',
    shopNameKo: '이우 헝다 가방',
    unitOriginal: '个',
    unitKo: '개',
    shopName: '이우 헝다 가방',
    shop: {
      id: 'shop-3',
      name: '이우 헝다 가방',
      nameOriginal: '义乌市恒达箱包有限公司',
      logo: 'https://picsum.photos/seed/shopbag/100/100',
      verified: true,
      location: '이우시 궈제상마오청 2층',
      locationOriginal: '义乌市国际商贸城二楼',
      responseRate: 95,
      products: 620,
      followers: 1890,
      descriptionOriginal: '箱包专业生产商，支持来样定做，最小起订量低。',
      descriptionKo: '가방 전문 생산업체, 샘플 맞춤 제작 가능, 낮은 최소 주문 수량.',
    },
  },
  // 4. 스마트워치/전자기기
  {
    id: 'prod-4',
    name: '스마트워치 1.85인치 대화면 건강관리 블루투스 통화',
    titleOriginal: '智能手表1.85寸大屏健康监测蓝牙通话运动手环',
    titleKo: '스마트워치 1.85인치 대화면 건강관리 블루투스 통화',
    imageUrl: 'https://picsum.photos/seed/watch1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/watch1d${i}/600/600`),
    category: '전자',
    priceKRW: 22500,
    originalPriceKRW: 32000,
    priceCNY: 119,
    discountPercent: 30,
    moq: 50,
    salesCount: 7200,
    badge: 'HOT' as const,
    rating: 4.3,
    reviewCount: 156,
    weightKg: 0.12,
    deliveryDays: '5~8',
    descOriginal: '1.85寸高清大屏智能手表，支持蓝牙通话、心率血氧监测、多种运动模式。IP68防水，续航7天。支持iOS和安卓系统。',
    descKo: '1.85인치 고화질 대화면 스마트워치로 블루투스 통화, 심박수/혈중산소 모니터링, 다양한 운동 모드를 지원합니다. IP68 방수, 7일 연속 사용 가능. iOS/Android 호환.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '银色', '金色', '玫瑰金'], valuesKo: ['블랙', '실버', '골드', '로즈골드'] },
      { labelOriginal: '表带', labelKo: '스트랩', valuesOriginal: ['硅胶', '不锈钢', '真皮'], valuesKo: ['실리콘', '스테인리스', '천연가죽'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '银色', '金色', '玫瑰金'], valuesKo: ['블랙', '실버', '골드', '로즈골드'] },
      { labelOriginal: '表带', labelKo: '스트랩', valuesOriginal: ['硅胶', '不锈钢', '真皮'], valuesKo: ['실리콘', '스테인리스', '천연가죽'] },
    ],
    specsOriginal: [
      { keyOriginal: '屏幕', keyKo: '화면', valueOriginal: '1.85寸IPS全触控', valueKo: '1.85인치 IPS 풀터치' },
      { keyOriginal: '防水等级', keyKo: '방수등급', valueOriginal: 'IP68', valueKo: 'IP68' },
      { keyOriginal: '电池', keyKo: '배터리', valueOriginal: '280mAh', valueKo: '280mAh' },
      { keyOriginal: '续航', keyKo: '사용시간', valueOriginal: '约7天', valueKo: '약 7일' },
      { keyOriginal: '兼容系统', keyKo: '호환 OS', valueOriginal: 'iOS 10+/Android 6.0+', valueKo: 'iOS 10+/Android 6.0+' },
    ],
    specsKo: [
      { keyOriginal: '屏幕', keyKo: '화면', valueOriginal: '1.85寸IPS全触控', valueKo: '1.85인치 IPS 풀터치' },
      { keyOriginal: '防水等级', keyKo: '방수등급', valueOriginal: 'IP68', valueKo: 'IP68' },
      { keyOriginal: '电池', keyKo: '배터리', valueOriginal: '280mAh', valueKo: '280mAh' },
      { keyOriginal: '续航', keyKo: '사용시간', valueOriginal: '约7天', valueKo: '약 7일' },
      { keyOriginal: '兼容系统', keyKo: '호환 OS', valueOriginal: 'iOS 10+/Android 6.0+', valueKo: 'iOS 10+/Android 6.0+' },
    ],
    shopNameOriginal: '深圳市创新智能科技有限公司',
    shopNameKo: '선전 창신 스마트테크',
    unitOriginal: '个',
    unitKo: '개',
    shopName: '선전 창신 스마트테크',
    shop: {
      id: 'shop-4',
      name: '선전 창신 스마트테크',
      nameOriginal: '深圳市创新智能科技有限公司',
      logo: 'https://picsum.photos/seed/shopwatch/100/100',
      verified: true,
      location: '선전시 난산구',
      locationOriginal: '深圳市南山区',
      responseRate: 99,
      products: 2340,
      followers: 5800,
      descriptionOriginal: '专注智能穿戴设备研发生产，通过多项国际认证。',
      descriptionKo: '스마트 웨어러블 기기 연구개발 및 생산 전문, 다수 국제 인증 보유.',
    },
  },
  // 5. 주방용품
  {
    id: 'prod-5',
    name: '실리콘 조리도구 12종 세트 내열 논스틱 주방용품',
    titleOriginal: '硅胶厨具12件套耐高温不粘锅专用烹饪工具套装',
    titleKo: '실리콘 조리도구 12종 세트 내열 논스틱 주방용품',
    imageUrl: 'https://picsum.photos/seed/kitchen1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/kitchen1d${i}/600/600`),
    category: '주방',
    priceKRW: 9800,
    originalPriceKRW: 13500,
    priceCNY: 52,
    discountPercent: 27,
    moq: 10,
    salesCount: 6350,
    badge: 'SALE' as const,
    rating: 4.6,
    reviewCount: 312,
    weightKg: 1.2,
    deliveryDays: '7~10',
    descOriginal: '食品级硅胶材质，耐高温230℃，适用于不粘锅。包含汤勺、漏勺、锅铲、刮刀等12种常用厨具。木质手柄防烫设计。',
    descKo: '식품 등급 실리콘 소재로 230도 고온에 견디며, 논스틱 팬에 적합합니다. 국자, 뒤집개, 스패튤러, 거품기 등 12종 필수 조리도구를 포함합니다. 원목 손잡이로 화상 방지 설계.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['绿色', '粉色', '灰色', '红色'], valuesKo: ['그린', '핑크', '그레이', '레드'] },
      { labelOriginal: '套装', labelKo: '구성', valuesOriginal: ['12件套', '6件套', '3件基础套'], valuesKo: ['12종 풀세트', '6종 세트', '3종 기본세트'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['绿色', '粉色', '灰色', '红色'], valuesKo: ['그린', '핑크', '그레이', '레드'] },
      { labelOriginal: '套装', labelKo: '구성', valuesOriginal: ['12件套', '6件套', '3件基础套'], valuesKo: ['12종 풀세트', '6종 세트', '3종 기본세트'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '食品级硅胶+榉木', valueKo: '식품등급 실리콘+너도밤나무' },
      { keyOriginal: '耐温', keyKo: '내열온도', valueOriginal: '-40℃~230℃', valueKo: '-40~230도' },
      { keyOriginal: '认证', keyKo: '인증', valueOriginal: 'FDA/LFGB', valueKo: 'FDA/LFGB' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.2公斤/套', valueKo: '약 1.2kg/세트' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '食品级硅胶+榉木', valueKo: '식품등급 실리콘+너도밤나무' },
      { keyOriginal: '耐温', keyKo: '내열온도', valueOriginal: '-40℃~230℃', valueKo: '-40~230도' },
      { keyOriginal: '认证', keyKo: '인증', valueOriginal: 'FDA/LFGB', valueKo: 'FDA/LFGB' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.2公斤/套', valueKo: '약 1.2kg/세트' },
    ],
    shopNameOriginal: '大华商社',
    shopNameKo: '대화상사',
    unitOriginal: '套',
    unitKo: '세트',
    shopName: '대화상사',
    shop: {
      id: 'shop-5',
      name: '대화상사',
      nameOriginal: '大华商社',
      logo: 'https://picsum.photos/seed/shopkitchen/100/100',
      verified: true,
      location: '이우시 궈제상마오청 1층',
      locationOriginal: '义乌市国际商贸城一楼',
      responseRate: 95,
      products: 892,
      followers: 2100,
      descriptionOriginal: '主营厨房用品、日用百货，品类齐全，价格优惠。',
      descriptionKo: '주방용품, 생활잡화 전문 취급, 다양한 품목, 합리적 가격.',
    },
  },
  // 6. 인테리어 소품
  {
    id: 'prod-6',
    name: '북유럽 감성 세라믹 화병 미니멀 인테리어 꽃병',
    titleOriginal: '北欧风格陶瓷花瓶简约现代插花装饰摆件客厅桌面',
    titleKo: '북유럽 감성 세라믹 화병 미니멀 인테리어 꽃병',
    imageUrl: 'https://picsum.photos/seed/deco1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/deco1d${i}/600/600`),
    category: '인테리어',
    priceKRW: 7200,
    priceCNY: 38,
    moq: 20,
    salesCount: 2950,
    badge: 'NEW' as const,
    rating: 4.4,
    reviewCount: 89,
    weightKg: 0.5,
    deliveryDays: '10~15',
    descOriginal: '北欧简约风格陶瓷花瓶，哑光釉面，手工拉坯制作。适合干花、鲜花装饰。多种颜色和造型可选。',
    descKo: '북유럽 미니멀 스타일 세라믹 화병, 무광 유약 마감, 수제 물레 성형 제작. 드라이플라워, 생화 장식에 적합합니다. 다양한 색상과 디자인 선택 가능.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['白色', '米色', '莫兰迪绿', '雾霾蓝'], valuesKo: ['화이트', '아이보리', '모란디 그린', '스모키 블루'] },
      { labelOriginal: '款式', labelKo: '디자인', valuesOriginal: ['圆球形', '水滴形', '圆柱形'], valuesKo: ['구형', '물방울형', '원통형'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['白色', '米色', '莫兰迪绿', '雾霾蓝'], valuesKo: ['화이트', '아이보리', '모란디 그린', '스모키 블루'] },
      { labelOriginal: '款式', labelKo: '디자인', valuesOriginal: ['圆球形', '水滴形', '圆柱形'], valuesKo: ['구형', '물방울형', '원통형'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '高温陶瓷', valueKo: '고온 세라믹' },
      { keyOriginal: '工艺', keyKo: '제작방식', valueOriginal: '手工拉坯+哑光釉', valueKo: '수제 물레+무광 유약' },
      { keyOriginal: '高度', keyKo: '높이', valueOriginal: '约15-25厘米', valueKo: '약 15~25cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约500克', valueKo: '약 500g' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '高温陶瓷', valueKo: '고온 세라믹' },
      { keyOriginal: '工艺', keyKo: '제작방식', valueOriginal: '手工拉坯+哑光釉', valueKo: '수제 물레+무광 유약' },
      { keyOriginal: '高度', keyKo: '높이', valueOriginal: '约15-25厘米', valueKo: '약 15~25cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约500克', valueKo: '약 500g' },
    ],
    shopNameOriginal: '义乌市雅居陶瓷工艺品有限公司',
    shopNameKo: '이우 야쥐 세라믹',
    unitOriginal: '个',
    unitKo: '개',
    shopName: '이우 야쥐 세라믹',
    shop: {
      id: 'shop-6',
      name: '이우 야쥐 세라믹',
      nameOriginal: '义乌市雅居陶瓷工艺品有限公司',
      logo: 'https://picsum.photos/seed/shopdeco/100/100',
      verified: true,
      location: '이우시 푸톈구 5구역 1층',
      locationOriginal: '义乌市福田区五区一楼',
      responseRate: 92,
      products: 450,
      followers: 1230,
      descriptionOriginal: '专业陶瓷装饰品生产，出口欧美日韩，品质保证。',
      descriptionKo: '세라믹 인테리어 소품 전문 생산, 유럽/미국/일본/한국 수출 실적, 품질 보장.',
    },
  },
  // 7. 뷰티/화장품 도구
  {
    id: 'prod-7',
    name: '메이크업 브러쉬 15종 세트 전문가용 화장 도구',
    titleOriginal: '化妆刷15支套装专业彩妆工具粉底刷眼影刷腮红刷',
    titleKo: '메이크업 브러쉬 15종 세트 전문가용 화장 도구',
    imageUrl: 'https://picsum.photos/seed/beauty1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/beauty1d${i}/600/600`),
    category: '뷰티',
    priceKRW: 11200,
    originalPriceKRW: 15000,
    priceCNY: 59,
    discountPercent: 25,
    moq: 20,
    salesCount: 5100,
    badge: 'HOT' as const,
    rating: 4.5,
    reviewCount: 267,
    weightKg: 0.35,
    deliveryDays: '7~10',
    descOriginal: '专业级化妆刷15支套装，采用优质纤维毛和实木手柄。包含粉底刷、散粉刷、腮红刷、眼影刷等全套。附赠PU皮收纳包。',
    descKo: '전문가급 메이크업 브러쉬 15종 세트, 고급 합성 섬유모와 원목 손잡이를 사용합니다. 파운데이션 브러쉬, 파우더 브러쉬, 블러셔 브러쉬, 아이섀도 브러쉬 등 풀세트. PU 가죽 파우치 증정.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑金色', '粉色', '白色'], valuesKo: ['블랙골드', '핑크', '화이트'] },
      { labelOriginal: '套装', labelKo: '구성', valuesOriginal: ['15支全套', '10支基础套', '5支入门套'], valuesKo: ['15종 풀세트', '10종 기본세트', '5종 입문세트'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑金色', '粉色', '白色'], valuesKo: ['블랙골드', '핑크', '화이트'] },
      { labelOriginal: '套装', labelKo: '구성', valuesOriginal: ['15支全套', '10支基础套', '5支入门套'], valuesKo: ['15종 풀세트', '10종 기본세트', '5종 입문세트'] },
    ],
    specsOriginal: [
      { keyOriginal: '刷毛', keyKo: '브러쉬모', valueOriginal: '高级纤维毛', valueKo: '고급 합성 섬유모' },
      { keyOriginal: '手柄', keyKo: '손잡이', valueOriginal: '实木+铝管', valueKo: '원목+알루미늄관' },
      { keyOriginal: '收纳', keyKo: '보관', valueOriginal: 'PU皮包', valueKo: 'PU 가죽 파우치' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约350克/套', valueKo: '약 350g/세트' },
    ],
    specsKo: [
      { keyOriginal: '刷毛', keyKo: '브러쉬모', valueOriginal: '高级纤维毛', valueKo: '고급 합성 섬유모' },
      { keyOriginal: '手柄', keyKo: '손잡이', valueOriginal: '实木+铝管', valueKo: '원목+알루미늄관' },
      { keyOriginal: '收纳', keyKo: '보관', valueOriginal: 'PU皮包', valueKo: 'PU 가죽 파우치' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约350克/套', valueKo: '약 350g/세트' },
    ],
    shopNameOriginal: '义乌市美妆汇化妆品有限公司',
    shopNameKo: '이우 메이장후이 뷰티',
    unitOriginal: '套',
    unitKo: '세트',
    shopName: '이우 메이장후이 뷰티',
    shop: {
      id: 'shop-7',
      name: '이우 메이장후이 뷰티',
      nameOriginal: '义乌市美妆汇化妆品有限公司',
      logo: 'https://picsum.photos/seed/shopbeauty/100/100',
      verified: true,
      location: '이우시 푸톈구 2구역 3층',
      locationOriginal: '义乌市福田区二区三楼',
      responseRate: 96,
      products: 580,
      followers: 3200,
      descriptionOriginal: '化妆工具生产商，产品远销30多个国家。',
      descriptionKo: '화장 도구 전문 제조업체, 30개국 이상 수출 실적 보유.',
    },
  },
  // 8. 문구/사무용품
  {
    id: 'prod-8',
    name: '감성 다이어리 A5 가죽 커버 위클리 플래너 2024',
    titleOriginal: 'A5皮面笔记本商务记事本周计划手账本2024日程本',
    titleKo: '감성 다이어리 A5 가죽 커버 위클리 플래너 2024',
    imageUrl: 'https://picsum.photos/seed/stationery1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/stat1d${i}/600/600`),
    category: '문구',
    priceKRW: 4200,
    priceCNY: 22,
    moq: 100,
    salesCount: 15600,
    badge: 'TOP' as const,
    rating: 4.7,
    reviewCount: 487,
    weightKg: 0.3,
    deliveryDays: '7~10',
    descOriginal: 'A5商务皮面笔记本，内含周计划/月计划/空白页。PU皮封面压印logo可定制。200页80克道林纸，书写顺滑不透墨。',
    descKo: 'A5 비즈니스 가죽 노트, 주간 플랜/월간 플랜/공백 페이지 포함. PU 가죽 표지 로고 각인 맞춤 제작 가능. 200페이지 80g 모조지, 필기감이 좋고 잉크가 비치지 않습니다.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '棕色', '深蓝', '酒红'], valuesKo: ['블랙', '브라운', '네이비', '와인'] },
      { labelOriginal: '内页', labelKo: '내지', valuesOriginal: ['周计划', '月计划', '空白页', '方格'], valuesKo: ['위클리', '먼슬리', '무지', '그리드'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['黑色', '棕色', '深蓝', '酒红'], valuesKo: ['블랙', '브라운', '네이비', '와인'] },
      { labelOriginal: '内页', labelKo: '내지', valuesOriginal: ['周计划', '月计划', '空白页', '方格'], valuesKo: ['위클리', '먼슬리', '무지', '그리드'] },
    ],
    specsOriginal: [
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: 'A5 (148x210mm)', valueKo: 'A5 (148x210mm)' },
      { keyOriginal: '封面', keyKo: '표지', valueOriginal: 'PU皮', valueKo: 'PU 가죽' },
      { keyOriginal: '内页', keyKo: '내지', valueOriginal: '200页80克道林纸', valueKo: '200페이지 80g 모조지' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约300克', valueKo: '약 300g' },
    ],
    specsKo: [
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: 'A5 (148x210mm)', valueKo: 'A5 (148x210mm)' },
      { keyOriginal: '封面', keyKo: '표지', valueOriginal: 'PU皮', valueKo: 'PU 가죽' },
      { keyOriginal: '内页', keyKo: '내지', valueOriginal: '200页80克道林纸', valueKo: '200페이지 80g 모조지' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约300克', valueKo: '약 300g' },
    ],
    shopNameOriginal: '义乌市创意文具有限公司',
    shopNameKo: '이우 창의문구',
    unitOriginal: '本',
    unitKo: '권',
    shopName: '이우 창의문구',
    shop: {
      id: 'shop-8',
      name: '이우 창의문구',
      nameOriginal: '义乌市创意文具有限公司',
      logo: 'https://picsum.photos/seed/shopstat/100/100',
      verified: true,
      location: '이우시 궈제상마오청 3층',
      locationOriginal: '义乌市国际商贸城三楼',
      responseRate: 94,
      products: 1560,
      followers: 4200,
      descriptionOriginal: '文具办公用品综合供应商，支持定制印刷。',
      descriptionKo: '문구 사무용품 종합 공급업체, 맞춤 인쇄 가능.',
    },
  },
  // 9. 스포츠 용품
  {
    id: 'prod-9',
    name: '요가 매트 TPE 6mm 양면 미끄럼방지 홈트레이닝',
    titleOriginal: 'TPE瑜伽垫6mm双面防滑健身垫家用运动垫加宽加厚',
    titleKo: '요가 매트 TPE 6mm 양면 미끄럼방지 홈트레이닝',
    imageUrl: 'https://picsum.photos/seed/sports1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/sports1d${i}/600/600`),
    category: '스포츠',
    priceKRW: 8500,
    originalPriceKRW: 12000,
    priceCNY: 45,
    discountPercent: 29,
    moq: 10,
    salesCount: 4800,
    badge: 'SALE' as const,
    rating: 4.6,
    reviewCount: 234,
    weightKg: 0.9,
    deliveryDays: '7~12',
    descOriginal: '环保TPE材质瑜伽垫，6mm厚度，双面防滑纹理。183x68cm加宽设计，附赠收纳带。无异味，皮肤友好。',
    descKo: '친환경 TPE 소재 요가 매트, 6mm 두께, 양면 미끄럼 방지 텍스처. 183x68cm 와이드 설계, 수납 스트랩 포함. 무취, 피부 친화적 소재.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['紫色', '蓝色', '粉色', '绿色', '黑色'], valuesKo: ['퍼플', '블루', '핑크', '그린', '블랙'] },
      { labelOriginal: '厚度', labelKo: '두께', valuesOriginal: ['6mm', '8mm', '10mm'], valuesKo: ['6mm', '8mm', '10mm'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['紫色', '蓝色', '粉色', '绿色', '黑色'], valuesKo: ['퍼플', '블루', '핑크', '그린', '블랙'] },
      { labelOriginal: '厚度', labelKo: '두께', valuesOriginal: ['6mm', '8mm', '10mm'], valuesKo: ['6mm', '8mm', '10mm'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '环保TPE', valueKo: '친환경 TPE' },
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: '183x68cm', valueKo: '183x68cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约900克', valueKo: '약 900g' },
      { keyOriginal: '配件', keyKo: '구성품', valueOriginal: '瑜伽垫+收纳带', valueKo: '요가 매트+수납 스트랩' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '环保TPE', valueKo: '친환경 TPE' },
      { keyOriginal: '尺寸', keyKo: '사이즈', valueOriginal: '183x68cm', valueKo: '183x68cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约900克', valueKo: '약 900g' },
      { keyOriginal: '配件', keyKo: '구성품', valueOriginal: '瑜伽垫+收纳带', valueKo: '요가 매트+수납 스트랩' },
    ],
    shopNameOriginal: '义乌市健力达体育用品有限公司',
    shopNameKo: '이우 젠리다 스포츠',
    unitOriginal: '条',
    unitKo: '장',
    shopName: '이우 젠리다 스포츠',
    shop: {
      id: 'shop-9',
      name: '이우 젠리다 스포츠',
      nameOriginal: '义乌市健力达体育用品有限公司',
      logo: 'https://picsum.photos/seed/shopsport/100/100',
      verified: true,
      location: '이우시 푸톈구 1구역 2층',
      locationOriginal: '义乌市福田区一区二楼',
      responseRate: 93,
      products: 720,
      followers: 1870,
      descriptionOriginal: '体育运动用品生产厂家，多年出口经验。',
      descriptionKo: '스포츠 용품 전문 생산업체, 다년간 수출 경력 보유.',
    },
  },
  // 10. 아동 완구
  {
    id: 'prod-10',
    name: '자석 블록 100PCS 교육 완구 창의력 발달 어린이 선물',
    titleOriginal: '磁力片积木100片装儿童益智玩具创意拼装磁性建构片',
    titleKo: '자석 블록 100PCS 교육 완구 창의력 발달 어린이 선물',
    imageUrl: 'https://picsum.photos/seed/toy1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/toy1d${i}/600/600`),
    category: '완구',
    priceKRW: 18500,
    originalPriceKRW: 25000,
    priceCNY: 98,
    discountPercent: 26,
    moq: 5,
    salesCount: 3200,
    badge: 'NEW' as const,
    rating: 4.8,
    reviewCount: 178,
    weightKg: 1.5,
    deliveryDays: '7~12',
    descOriginal: '100片磁力积木套装，包含三角形、正方形、五边形等多种形状。ABS环保材质，强磁不脱落。附赠收纳箱和创意手册。适合3岁以上儿童。',
    descKo: '100PCS 자석 블록 세트, 삼각형, 사각형, 오각형 등 다양한 형태 포함. ABS 친환경 소재, 강력 자석으로 분리되지 않습니다. 수납함과 창의력 가이드북 포함. 3세 이상 대상.',
    optionsOriginal: [
      { labelOriginal: '规格', labelKo: '구성', valuesOriginal: ['100片装', '60片装', '150片豪华装'], valuesKo: ['100PCS', '60PCS', '150PCS 디럭스'] },
      { labelOriginal: '包装', labelKo: '포장', valuesOriginal: ['收纳箱装', '袋装'], valuesKo: ['수납함 포장', '파우치 포장'] },
    ],
    optionsKo: [
      { labelOriginal: '规格', labelKo: '구성', valuesOriginal: ['100片装', '60片装', '150片豪华装'], valuesKo: ['100PCS', '60PCS', '150PCS 디럭스'] },
      { labelOriginal: '包装', labelKo: '포장', valuesOriginal: ['收纳箱装', '袋装'], valuesKo: ['수납함 포장', '파우치 포장'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: 'ABS环保塑料', valueKo: 'ABS 친환경 플라스틱' },
      { keyOriginal: '适用年龄', keyKo: '대상 연령', valueOriginal: '3岁以上', valueKo: '3세 이상' },
      { keyOriginal: '认证', keyKo: '인증', valueOriginal: 'CE/CPC/ASTM', valueKo: 'CE/CPC/ASTM' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.5公斤/套', valueKo: '약 1.5kg/세트' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: 'ABS环保塑料', valueKo: 'ABS 친환경 플라스틱' },
      { keyOriginal: '适用年龄', keyKo: '대상 연령', valueOriginal: '3岁以上', valueKo: '3세 이상' },
      { keyOriginal: '认证', keyKo: '인증', valueOriginal: 'CE/CPC/ASTM', valueKo: 'CE/CPC/ASTM' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.5公斤/套', valueKo: '약 1.5kg/세트' },
    ],
    shopNameOriginal: '义乌市乐智玩具有限公司',
    shopNameKo: '이우 러즈 완구',
    unitOriginal: '套',
    unitKo: '세트',
    shopName: '이우 러즈 완구',
    shop: {
      id: 'shop-10',
      name: '이우 러즈 완구',
      nameOriginal: '义乌市乐智玩具有限公司',
      logo: 'https://picsum.photos/seed/shoptoy/100/100',
      verified: true,
      location: '이우시 푸톈구 1구역 3층',
      locationOriginal: '义乌市福田区一区三楼',
      responseRate: 96,
      products: 1350,
      followers: 4500,
      descriptionOriginal: '教育益智玩具专业生产商，产品通过多项国际安全认证。',
      descriptionKo: '교육 완구 전문 생산업체, 다수 국제 안전 인증 보유.',
    },
  },
  // 11. 패션 액세서리
  {
    id: 'prod-11',
    name: '스테인리스 목걸이 레이어드 체인 데일리 주얼리',
    titleOriginal: '不锈钢项链多层叠戴链条韩版时尚日常百搭首饰女',
    titleKo: '스테인리스 목걸이 레이어드 체인 데일리 주얼리',
    imageUrl: 'https://picsum.photos/seed/acc1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/acc1d${i}/600/600`),
    category: '액세서리',
    priceKRW: 3800,
    priceCNY: 19.9,
    moq: 50,
    salesCount: 8900,
    badge: 'HOT' as const,
    rating: 4.4,
    reviewCount: 356,
    weightKg: 0.05,
    deliveryDays: '5~8',
    descOriginal: '316L不锈钢材质，不易过敏不褪色。多层叠戴设计，可单独或搭配佩戴。包含40+5cm延长链。',
    descKo: '316L 스테인리스 소재로 알러지 유발이 적고 변색되지 않습니다. 레이어드 디자인으로 단독 또는 조합 착용이 가능합니다. 40+5cm 연장 체인 포함.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['金色', '银色', '玫瑰金'], valuesKo: ['골드', '실버', '로즈골드'] },
      { labelOriginal: '款式', labelKo: '디자인', valuesOriginal: ['蛇骨链', '珠链', '锁骨链'], valuesKo: ['스네이크 체인', '볼 체인', '쇄골 체인'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['金色', '银色', '玫瑰金'], valuesKo: ['골드', '실버', '로즈골드'] },
      { labelOriginal: '款式', labelKo: '디자인', valuesOriginal: ['蛇骨链', '珠链', '锁骨链'], valuesKo: ['스네이크 체인', '볼 체인', '쇄골 체인'] },
    ],
    specsOriginal: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '316L不锈钢', valueKo: '316L 스테인리스' },
      { keyOriginal: '长度', keyKo: '길이', valueOriginal: '40+5cm延长链', valueKo: '40+5cm 연장 체인' },
      { keyOriginal: '镀层', keyKo: '도금', valueOriginal: '18K镀金/白金', valueKo: '18K 금도금/백금도금' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约15-20克', valueKo: '약 15~20g' },
    ],
    specsKo: [
      { keyOriginal: '材质', keyKo: '소재', valueOriginal: '316L不锈钢', valueKo: '316L 스테인리스' },
      { keyOriginal: '长度', keyKo: '길이', valueOriginal: '40+5cm延长链', valueKo: '40+5cm 연장 체인' },
      { keyOriginal: '镀层', keyKo: '도금', valueOriginal: '18K镀金/白金', valueKo: '18K 금도금/백금도금' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约15-20克', valueKo: '약 15~20g' },
    ],
    shopNameOriginal: '义乌市韩饰美首饰有限公司',
    shopNameKo: '이우 한스메이 주얼리',
    unitOriginal: '条',
    unitKo: '개',
    shopName: '이우 한스메이 주얼리',
    shop: {
      id: 'shop-11',
      name: '이우 한스메이 주얼리',
      nameOriginal: '义乌市韩饰美首饰有限公司',
      logo: 'https://picsum.photos/seed/shopacc/100/100',
      verified: true,
      location: '이우시 궈제상마오청 1층',
      locationOriginal: '义乌市国际商贸城一楼',
      responseRate: 97,
      products: 2800,
      followers: 6100,
      descriptionOriginal: '韩风首饰专业生产商，产品畅销日韩东南亚。',
      descriptionKo: '한국 스타일 주얼리 전문 생산업체, 일본/한국/동남아 판매 호조.',
    },
  },
  // 12. 캠핑/아웃도어
  {
    id: 'prod-12',
    name: '접이식 캠핑 체어 경량 알루미늄 야외 의자 휴대용',
    titleOriginal: '折叠露营椅轻量铝合金户外椅便携式钓鱼椅沙滩椅',
    titleKo: '접이식 캠핑 체어 경량 알루미늄 야외 의자 휴대용',
    imageUrl: 'https://picsum.photos/seed/camp1/400/400',
    images: Array.from({ length: 6 }, (_, i) => `https://picsum.photos/seed/camp1d${i}/600/600`),
    category: '캠핑',
    priceKRW: 12500,
    originalPriceKRW: 16000,
    priceCNY: 66,
    discountPercent: 22,
    moq: 10,
    salesCount: 2760,
    badge: 'NEW' as const,
    rating: 4.5,
    reviewCount: 145,
    weightKg: 1.1,
    deliveryDays: '7~12',
    descOriginal: '7075航空铝合金框架，承重150kg。600D牛津布面料防水耐磨。折叠后仅35cm，配收纳袋。多档靠背调节。',
    descKo: '7075 항공 알루미늄 합금 프레임, 150kg 하중 지지. 600D 옥스포드 원단으로 방수 및 내마모성 우수. 접었을 때 35cm로 수납 가방 포함. 다단계 등받이 조절 가능.',
    optionsOriginal: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['军绿', '卡其色', '黑色', '天蓝'], valuesKo: ['카키그린', '베이지', '블랙', '스카이블루'] },
      { labelOriginal: '款式', labelKo: '종류', valuesOriginal: ['标准款', '加大款', '带头枕款'], valuesKo: ['기본형', '대형', '헤드레스트형'] },
    ],
    optionsKo: [
      { labelOriginal: '颜色', labelKo: '색상', valuesOriginal: ['军绿', '卡其色', '黑色', '天蓝'], valuesKo: ['카키그린', '베이지', '블랙', '스카이블루'] },
      { labelOriginal: '款式', labelKo: '종류', valuesOriginal: ['标准款', '加大款', '带头枕款'], valuesKo: ['기본형', '대형', '헤드레스트형'] },
    ],
    specsOriginal: [
      { keyOriginal: '框架', keyKo: '프레임', valueOriginal: '7075铝合金', valueKo: '7075 알루미늄 합금' },
      { keyOriginal: '面料', keyKo: '원단', valueOriginal: '600D牛津布', valueKo: '600D 옥스포드' },
      { keyOriginal: '承重', keyKo: '하중', valueOriginal: '150公斤', valueKo: '150kg' },
      { keyOriginal: '折叠尺寸', keyKo: '수납 사이즈', valueOriginal: '35x12x12cm', valueKo: '35x12x12cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.1公斤', valueKo: '약 1.1kg' },
    ],
    specsKo: [
      { keyOriginal: '框架', keyKo: '프레임', valueOriginal: '7075铝合金', valueKo: '7075 알루미늄 합금' },
      { keyOriginal: '面料', keyKo: '원단', valueOriginal: '600D牛津布', valueKo: '600D 옥스포드' },
      { keyOriginal: '承重', keyKo: '하중', valueOriginal: '150公斤', valueKo: '150kg' },
      { keyOriginal: '折叠尺寸', keyKo: '수납 사이즈', valueOriginal: '35x12x12cm', valueKo: '35x12x12cm' },
      { keyOriginal: '重量', keyKo: '무게', valueOriginal: '约1.1公斤', valueKo: '약 1.1kg' },
    ],
    shopNameOriginal: '义乌市探路者户外用品有限公司',
    shopNameKo: '이우 탄루저 아웃도어',
    unitOriginal: '把',
    unitKo: '개',
    shopName: '이우 탄루저 아웃도어',
    shop: {
      id: 'shop-12',
      name: '이우 탄루저 아웃도어',
      nameOriginal: '义乌市探路者户外用品有限公司',
      logo: 'https://picsum.photos/seed/shopcamp/100/100',
      verified: true,
      location: '이우시 푸톈구 2구역 1층',
      locationOriginal: '义乌市福田区二区一楼',
      responseRate: 94,
      products: 380,
      followers: 1560,
      descriptionOriginal: '户外露营用品专业供应商，工厂直销。',
      descriptionKo: '캠핑/아웃도어 용품 전문 공급업체, 공장 직영.',
    },
  },
];

// --- Legacy Product interface compatibility ---

export function generateMockProduct(id: number, badge?: Product['badge']): Product {
  const detailed = DETAILED_PRODUCTS[id % DETAILED_PRODUCTS.length];
  const priceKRW = detailed.priceKRW + ((id * 1237) % 5000);
  const priceCNY = Math.round(priceKRW / MOCK_EXCHANGE_RATE.rate);
  const hasSale = badge === 'SALE' || id % 5 === 0;
  return {
    id: `prod-${id}`,
    name: detailed.titleKo,
    imageUrl: `https://picsum.photos/seed/yiwu${id}/400/400`,
    category: detailed.category,
    priceKRW,
    originalPriceKRW: hasSale ? Math.floor(priceKRW * 1.3) : undefined,
    priceCNY,
    discountPercent: hasSale ? 30 : undefined,
    moq: detailed.moq,
    salesCount: (id * 997) % 8000,
    badge: badge ?? detailed.badge ?? null,
    shopName: detailed.shopNameKo,
    rating: detailed.rating,
    reviewCount: detailed.reviewCount,
  };
}

export const MOCK_PRODUCTS: Product[] = DETAILED_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.titleKo,
  imageUrl: p.imageUrl,
  category: p.category,
  priceKRW: p.priceKRW,
  originalPriceKRW: p.originalPriceKRW,
  priceCNY: p.priceCNY,
  discountPercent: p.discountPercent,
  moq: p.moq,
  salesCount: p.salesCount,
  badge: p.badge ?? null,
  shopName: p.shopNameKo,
  rating: p.rating,
  reviewCount: p.reviewCount,
}));

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
      { productId: 'prod-2', productName: 'LED 무드등 RGB 감성 조명 리모컨 포함 인테리어 수면등', imageUrl: 'https://picsum.photos/seed/led1/400/400', quantity: 100, priceKRW: 5600 },
      { productId: 'prod-4', productName: '스마트워치 1.85인치 대화면 건강관리 블루투스 통화', imageUrl: 'https://picsum.photos/seed/watch1/400/400', quantity: 50, priceKRW: 22500 },
    ],
    totalKRW: 1685000,
    totalCNY: 9040,
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
      { productId: 'prod-5', productName: '실리콘 조리도구 12종 세트 내열 논스틱 주방용품', imageUrl: 'https://picsum.photos/seed/kitchen1/400/400', quantity: 30, priceKRW: 9800 },
    ],
    totalKRW: 294000,
    totalCNY: 1577,
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
      { productId: 'prod-8', productName: '감성 다이어리 A5 가죽 커버 위클리 플래너 2024', imageUrl: 'https://picsum.photos/seed/stationery1/400/400', quantity: 200, priceKRW: 4200 },
      { productId: 'prod-11', productName: '스테인리스 목걸이 레이어드 체인 데일리 주얼리', imageUrl: 'https://picsum.photos/seed/acc1/400/400', quantity: 100, priceKRW: 3800 },
    ],
    totalKRW: 1220000,
    totalCNY: 6544,
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
      { productId: 'prod-9', productName: '요가 매트 TPE 6mm 양면 미끄럼방지 홈트레이닝', imageUrl: 'https://picsum.photos/seed/sports1/400/400', quantity: 80, priceKRW: 8500 },
    ],
    totalKRW: 680000,
    totalCNY: 3649,
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
      { productId: 'prod-12', productName: '접이식 캠핑 체어 경량 알루미늄 야외 의자 휴대용', imageUrl: 'https://picsum.photos/seed/camp1/400/400', quantity: 20, priceKRW: 12500 },
    ],
    totalKRW: 250000,
    totalCNY: 1341,
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
    message: 'LED 무드등 RGB 감성 조명의 가격이 15% 인하되었습니다.',
    isRead: false,
    createdAt: '2026-04-08T14:30:00Z',
    link: '/product/prod-2',
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
    productId: 'prod-2',
    productName: 'LED 무드등 RGB 감성 조명 리모컨 포함 인테리어 수면등',
    rating: 5,
    content: '품질이 정말 좋습니다. MOQ도 적어서 소량 테스트하기 좋았어요. 재주문 예정입니다.',
    images: ['https://picsum.photos/seed/rev1a/300/300', 'https://picsum.photos/seed/rev1b/300/300'],
    userName: '김바이어',
    createdAt: '2026-04-05T12:00:00Z',
  },
  {
    id: 'rev-2',
    productId: 'prod-4',
    productName: '스마트워치 1.85인치 대화면 건강관리 블루투스 통화',
    rating: 4,
    content: '배송이 빠르고 검수 서비스가 꼼꼼했습니다. 불량률도 거의 없었어요.',
    images: [],
    userName: '이도매',
    createdAt: '2026-04-02T08:30:00Z',
  },
  {
    id: 'rev-3',
    productId: 'prod-5',
    productName: '실리콘 조리도구 12종 세트 내열 논스틱 주방용품',
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
    nameKo: '이우 페이위에 슈즈',
    nameOriginal: '义乌市飞越鞋业有限公司',
    boothNumber: 'A-1-2345',
    logoUrl: 'https://picsum.photos/seed/shop1/200/200',
    productCount: 860,
    responseRate: 97,
    yearsInBusiness: 15,
    isVerified: true,
    rating: 4.7,
    categories: ['신발', '스포츠'],
  },
  {
    id: 'shop-2',
    nameKo: '금영무역',
    nameOriginal: '金英贸易有限公司',
    boothNumber: 'B-3-1567',
    logoUrl: 'https://picsum.photos/seed/shop2/200/200',
    productCount: 1240,
    responseRate: 98,
    yearsInBusiness: 15,
    isVerified: true,
    rating: 4.8,
    categories: ['조명', '전자'],
  },
  {
    id: 'shop-3',
    nameKo: '이우 헝다 가방',
    nameOriginal: '义乌市恒达箱包有限公司',
    boothNumber: 'C-2-0891',
    logoUrl: 'https://picsum.photos/seed/shop3/200/200',
    productCount: 620,
    responseRate: 95,
    yearsInBusiness: 8,
    isVerified: true,
    rating: 4.5,
    categories: ['가방', '패션'],
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
