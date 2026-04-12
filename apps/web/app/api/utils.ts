import { normalizeImageUrl } from '../../lib/yiwugo-server';
import { translateText as translateTextService, translateSync, translateBatch } from '../../lib/translation-service';

/**
 * 이우고 시장 구역(subMarket) → 카테고리 매핑
 * 이우국제상무성(义乌国际商贸城) 기준:
 *   1001: 1구역 (완구, 액세서리, 공예품, 장식품, 화장품)
 *   1002: 1구역 부속 (우산, 우비, 가방, 모자)
 *   1003: 2구역 (오금, 전자, 전기, 자동차용품, 공구)
 *   1004: 3구역 (문구, 체육용품, 화장품, 일용품)
 *   1005: 4구역 (양말, 속옷, 의류, 모자, 스카프)
 *   1006: 5구역 (수입상품, 침구, 봉제, 커튼, 직물)
 */
const SUBMARKET_CATEGORY_MAP: Record<string, string> = {
  '1001': '완구/액세서리',
  '1002': '가방/패션잡화',
  '1003': '철물/전자',
  '1004': '문구/생활용품',
  '1005': '의류/패션',
  '1006': '홈리빙/직물',
};

/**
 * 상품 제목 키워드 기반 세분류
 * 이우 시장의 실제 상품 구조를 반영한 키워드 매핑
 */
const KEYWORD_CATEGORY_MAP: [RegExp, string][] = [
  // 완구 (우선도 높음 - 이우 시장 주력 상품)
  [/玩具|毛绒|公仔|娃娃|拼图|积木|弹力球|盲盒|扭蛋|陀螺|泡泡|解压|弹珠|跳跳球|魔方|飞盘/, '완구'],

  // 포장/부자재 (비닐봉투 등 오분류 방지)
  [/包装|纸箱|塑料袋|背心袋|打包带|缠绕膜|气泡膜|马夹袋|方便袋|购物袋|垃圾袋/, '포장/부자재'],

  // 우산/비옷
  [/雨伞|太阳伞|折叠伞|晴雨|伞业|雨衣|雨具/, '우산/비옷'],

  // 주방/생활 (보온컵 등 먼저 매칭)
  [/保温[杯壶]|水[杯壶瓶]|碗|盘|杯|壶|锅|铲|勺|刀|叉|筷|餐具|厨房|厨具|烘焙|茶杯|泡茶|不锈钢/, '주방용품'],

  // 조명
  [/灯[泡带具串]|台灯|夜灯|吊灯|壁灯|射灯|LED灯|发光|荧光棒|灯笼/, '조명'],

  // 전자/디지털
  [/USB|充电|蓝牙|耳[机塞]|数据线|手机壳|手机[支架]|电[池源]|音[箱响]|移动电源|键盘|鼠标|电脑|平板/, '전자/디지털'],

  // 의류/패션
  [/裤|裙|衬衫|T恤|外套|连衣裙|风衣|夹克|卫衣|毛衣|棉衣|牛仔|服[饰装]|上衣|女装|男装|羽绒/, '의류'],

  // 양말 (袜 전용 - 의류보다 먼저)
  [/袜[子类]|丝袜|船袜|中筒袜|棉袜|男袜|女袜|长袜/, '양말'],

  // 신발
  [/鞋[子类]|靴|拖鞋|凉鞋|运动鞋|皮鞋|板鞋/, '신발'],

  // 속옷/언더웨어
  [/内衣|内裤|文胸|胸[贴罩]|睡衣|隐形文胸/, '속옷/언더웨어'],

  // 모자/스카프/헤어
  [/帽[子]|围[巾]|手套|头[巾带饰]|发[饰带夹圈箍]|假发|发箍/, '모자/스카프'],

  // 액세서리/주얼리
  [/项链|手链|耳环|戒指|胸针|饰品|首饰|珠宝|手[串镯环]|吊坠|菩提/, '액세서리'],

  // 시계
  [/手表|腕表|钟表|表带/, '시계'],

  // 안경
  [/眼镜|墨镜|太阳镜|近视/, '안경'],

  // 가방/수납
  [/背包|手提包|钱包|挎包|书包|收纳|行李箱|拉杆箱|化妆包|手拿包/, '가방/수납'],

  // 뷰티/개인위생
  [/化妆|美甲|睫毛|口红|粉底|美[容妆]|面[膜霜]|精华|护肤|彩妆|唇[彩膏]|腮红|眼影/, '뷰티'],
  [/牙[刷膏]|洗[发浴]|沐浴|梳[子]|剃须|指甲|卫生/, '개인위생'],

  // 생활잡화
  [/毛巾|浴巾|拖把|扫帚|清洁|抹布|冰箱贴|挂钩|钥匙扣|开瓶器/, '생활잡화'],

  // 사무/문구
  [/笔|文具|笔记本|便签|铅笔|圆珠笔|贴纸|印章|扭扭棒|手工|DIY|毛根/, '사무/문구'],

  // 철물/공구
  [/锁|螺丝|扳手|钻头|锤|工具|五金|电钻|钥匙|冲击钻|开孔/, '철물/공구'],

  // 스포츠/아웃도어
  [/运动|户外|登山|野营|帐篷|健身|瑜伽|自行车|球拍|跑步/, '스포츠/아웃도어'],

  // 반려동물
  [/宠物|猫[粮砂]|狗[粮链]|宠物用品/, '반려동물'],

  // 유아/출산
  [/婴儿|宝宝|奶瓶|纸尿裤|母婴|童装|童鞋/, '유아/출산'],

  // 자동차
  [/汽车|车载|车用|方向盘|车[灯垫饰内]/, '자동차용품'],

  // 축제/선물
  [/圣诞|节日|礼品|派对|气球|婚庆|蜡烛|彩带|彩旗/, '축제/선물'],

  // 가전
  [/风扇|冰箱|洗衣机|家电|电风扇|电热|加湿|除湿|吹风机/, '가전'],
];

/**
 * 상품 제목 + subMarket 기반 카테고리 자동 분류
 */
function classifyProduct(title: string, subMarket?: string): string {
  // 1차: 키워드 매칭 (가장 정확)
  for (const [regex, category] of KEYWORD_CATEGORY_MAP) {
    if (regex.test(title)) return category;
  }

  // 2차: subMarket 기반
  if (subMarket && SUBMARKET_CATEGORY_MAP[subMarket]) {
    return SUBMARKET_CATEGORY_MAP[subMarket];
  }

  // 3차: 기본값
  return '기타';
}

/**
 * 원시 Yiwugo 상품 데이터에서 공통 필드를 추출 (번역 제외)
 * 내부 헬퍼 - mapProduct/mapProductsAsync에서 공유
 */
function extractProductFields(raw: any, rate: number) {
  let priceCny = 0;
  if (raw.totalprice) {
    priceCny = parseFloat(raw.totalprice);
  } else if (raw.sellPrice !== undefined) {
    const sellPrice = Number(raw.sellPrice);
    priceCny = sellPrice / 100;
  }

  const priceKrw = Math.round(priceCny * rate * 1.05);
  const imageUrl = normalizeImageUrl(raw.picture1 || raw.imgUrl || raw.picUrl || '');
  const rawTitle = raw.title || raw.productName || raw.newtitle || '';
  const rawShopName = raw.shopName || '';
  const category = raw.categoryName || classifyProduct(rawTitle, raw.subMarket);

  return {
    id: String(raw.id || raw.productId || raw.num || ''),
    rawTitle,
    rawShopName,
    imageUrl,
    category,
    priceKRW: priceKrw,
    priceCNY: Number(priceCny.toFixed(2)),
    moq: parseInt(raw.startNum || raw.smallNum || raw.beginNumber || '1', 10),
    salesCount: parseInt(raw.dealQuantitys || raw.dealQuantity || raw.sellCounts || '0', 10),
    shopId: String(raw.shopId || ''),
    boothNumber: raw.boothNo || '',
  };
}

/**
 * @deprecated
 * 동기 버전 (캐시 + 용어사전만). 가능하면 mapProductsAsync를 사용하세요.
 * 번역이 누락될 수 있습니다.
 */
export function mapProduct(raw: any, rate = 198) {
  const base = extractProductFields(raw, rate);
  // 서버사이드 즉시 번역 (캐시 + 용어사전)
  const title = translateSync(base.rawTitle);
  const shopName = translateSync(base.rawShopName);

  return {
    id: base.id,
    name: title,
    nameOriginal: base.rawTitle !== title ? base.rawTitle : undefined,
    imageUrl: base.imageUrl,
    category: base.category,
    priceKRW: base.priceKRW,
    priceCNY: base.priceCNY,
    moq: base.moq,
    salesCount: base.salesCount,
    shopName,
    shopId: base.shopId,
    boothNumber: base.boothNumber,
    badge: null as 'TOP' | 'SALE' | 'HOT' | 'NEW' | null,
  };
}

/**
 * 여러 상품을 한 번에 완전 번역하여 매핑
 *
 * - 모든 상품명/상점명을 수집해서 translateBatch로 한 번에 번역
 * - 캐시 히트가 대부분이면 매우 빠름
 * - 캐시 미스가 있으면 API 호출 (3초 타임아웃)
 * - 클라이언트는 100% 번역된 데이터만 받음 → "점프 현상" 제거
 */
export async function mapProductsAsync(rawProducts: any[], rate = 198) {
  if (!Array.isArray(rawProducts) || rawProducts.length === 0) return [];

  // 1. 기본 필드 추출
  const extracted = rawProducts.map((raw) => extractProductFields(raw, rate));

  // 2. 번역할 텍스트 수집 (중복 제거)
  const textsToTranslate = new Set<string>();
  extracted.forEach((item) => {
    if (item.rawTitle) textsToTranslate.add(item.rawTitle);
    if (item.rawShopName) textsToTranslate.add(item.rawShopName);
  });

  const uniqueTexts = Array.from(textsToTranslate);

  // 3. 일괄 번역
  const translations = await translateBatch(uniqueTexts);
  const translationMap = new Map<string, string>();
  uniqueTexts.forEach((text, i) => {
    translationMap.set(text, translations[i] || text);
  });

  // 4. 번역 결과 매핑
  return extracted.map((item) => {
    const title = translationMap.get(item.rawTitle) || item.rawTitle;
    const shopName = translationMap.get(item.rawShopName) || item.rawShopName;

    return {
      id: item.id,
      name: title,
      nameOriginal: item.rawTitle !== title ? item.rawTitle : undefined,
      imageUrl: item.imageUrl,
      category: item.category,
      priceKRW: item.priceKRW,
      priceCNY: item.priceCNY,
      moq: item.moq,
      salesCount: item.salesCount,
      shopName,
      shopId: item.shopId,
      boothNumber: item.boothNumber,
      badge: null as 'TOP' | 'SALE' | 'HOT' | 'NEW' | null,
    };
  });
}

// Translate a batch of mapped products (translate names)
export async function translateProducts(products: any[]): Promise<any[]> {
  const results = await Promise.all(
    products.map(async (p) => {
      const translatedName = await translateTextService(p.name);
      return { ...p, name: translatedName };
    })
  );
  return results;
}

// 동기 번역 (캐시 + 용어사전만, API 호출 없음) - 빠른 상품명 번역
export function translateProductSync(name: string): string {
  return translateSync(name);
}
