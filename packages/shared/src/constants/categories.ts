export interface YiwugoCategory {
  code: string;
  nameZh: string;
  nameKo: string;
  icon: string;
  slug: string;
}

export const YIWUGO_CATEGORIES: YiwugoCategory[] = [
  { code: '01', nameZh: '玩具', nameKo: '완구', icon: '🧸', slug: 'toys' },
  { code: '02', nameZh: '工艺品', nameKo: '공예품', icon: '🏺', slug: 'crafts' },
  { code: '03', nameZh: '饰品', nameKo: '액세서리', icon: '💍', slug: 'accessories' },
  { code: '04', nameZh: '箱包', nameKo: '가방', icon: '👜', slug: 'bags' },
  { code: '05', nameZh: '服装', nameKo: '의류', icon: '👕', slug: 'apparel' },
  { code: '06', nameZh: '内衣', nameKo: '속옷', icon: '👙', slug: 'underwear' },
  { code: '07', nameZh: '袜子', nameKo: '양말', icon: '🧦', slug: 'socks' },
  { code: '08', nameZh: '鞋子', nameKo: '신발', icon: '👟', slug: 'shoes' },
  { code: '09', nameZh: '帽子', nameKo: '모자', icon: '🧢', slug: 'hats' },
  { code: '10', nameZh: '围巾', nameKo: '스카프', icon: '🧣', slug: 'scarves' },
  { code: '11', nameZh: '皮带', nameKo: '벨트', icon: '🪢', slug: 'belts' },
  { code: '12', nameZh: '眼镜', nameKo: '안경', icon: '👓', slug: 'glasses' },
  { code: '13', nameZh: '钟表', nameKo: '시계', icon: '⌚', slug: 'watches' },
  { code: '14', nameZh: '珠宝', nameKo: '보석', icon: '💎', slug: 'jewelry' },
  { code: '15', nameZh: '厨房用品', nameKo: '주방', icon: '🍳', slug: 'kitchen' },
  { code: '16', nameZh: '日用百货', nameKo: '일용품', icon: '🧴', slug: 'daily' },
  { code: '17', nameZh: '文具', nameKo: '문구', icon: '✏️', slug: 'stationery' },
  { code: '18', nameZh: '办公用品', nameKo: '사무', icon: '🖨️', slug: 'office' },
  { code: '19', nameZh: '体育用品', nameKo: '체육', icon: '⚽', slug: 'sports' },
  { code: '20', nameZh: '电子产品', nameKo: '전자', icon: '📱', slug: 'electronics' },
  { code: '21', nameZh: '化妆品', nameKo: '화장품', icon: '💄', slug: 'cosmetics' },
  { code: '22', nameZh: '家居装饰', nameKo: '인테리어', icon: '🛋️', slug: 'interior' },
  { code: '23', nameZh: '灯饰', nameKo: '조명', icon: '💡', slug: 'lighting' },
  { code: '24', nameZh: '包装用品', nameKo: '포장', icon: '📦', slug: 'packaging' },
  { code: '25', nameZh: '汽车用品', nameKo: '오토', icon: '🚗', slug: 'auto' },
  { code: '26', nameZh: '五金工具', nameKo: '철물', icon: '🔧', slug: 'hardware' },
];
