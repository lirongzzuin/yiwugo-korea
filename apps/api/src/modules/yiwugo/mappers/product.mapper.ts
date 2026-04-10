import { Product, ProductOption, ProductOptionValue } from '@yiwugo/shared';

interface Translations {
  title: string;
  desc: string;
  options: string;
}

/**
 * 제품 목록 항목을 정규화된 Product 형식으로 매핑
 * /open/cn_product/list의 prslist[] 항목 사용
 *
 * @param raw - Yiwugo API의 원본 제품 (list item)
 * @param translations - 번역된 텍스트 (제목, 설명, 옵션)
 * @param exchangeRate - CNY → KRW 환율 (예: 190.5)
 * @param commissionRate - 수수료율 (소수, 예: 0.08 = 8%)
 */
export function mapProductListItem(
  raw: any,
  translations: Translations,
  exchangeRate: number,
  commissionRate: number,
): Product {
  // sellPrice는 分(센트) 단위: 500 = 5.00 CNY
  const priceCny = (raw.sellPrice || 0) / 100;
  const baseKrw = Math.round(priceCny * exchangeRate);
  const commissionKrw = Math.round(baseKrw * commissionRate);
  const finalKrw = baseKrw + commissionKrw;

  // 이미지 URL 수집
  const imageUrls = normalizeImageUrl([raw.picture1, raw.picture2].filter(Boolean));

  // SKU 옵션 파싱 (있으면)
  const options: ProductOption[] = [];

  return {
    id: String(raw.id),
    titleOriginal: raw.title || '',
    titleKo: translations.title || '',
    priceOriginalCny: priceCny.toFixed(2),
    priceKrw: String(finalKrw),
    originalPriceKrw: String(baseKrw),
    minOrderQty: raw.startNum || 1,
    stock: undefined, // list에서는 재고 정보 없음
    imageUrls,
    categoryId: undefined,
    shopId: String(raw.shopId),
    shopName: raw.shopName,
    detailUrl: undefined,
    options: options.length > 0 ? options : undefined,
    optionsKo: undefined,
    viewCount: 0,
    salesCount: raw.sellCounts || 0,
    wishlistCount: 0,
    reviewCount: 0,
    isActive: true,
    isFeatured: false,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 제품 상세 정보를 정규화된 Product 형식으로 매핑
 * /open/cn_product/detail 응답 사용
 *
 * @param raw - Yiwugo API의 제품 상세 응답
 * @param translations - 번역된 텍스트 (제목, 설명, 옵션)
 * @param exchangeRate - CNY → KRW 환율 (예: 190.5)
 * @param commissionRate - 수수료율 (소수, 예: 0.08 = 8%)
 */
export function mapProductDetail(
  raw: any,
  translations: Translations,
  exchangeRate: number,
  commissionRate: number,
): Product {
  // unitprice는 YUAN 단위로 이미 숫자
  const priceCny = parseFloat(raw.unitprice || raw.totalprice || '0');
  const baseKrw = Math.round(priceCny * exchangeRate);
  const commissionKrw = Math.round(baseKrw * commissionRate);
  const finalKrw = baseKrw + commissionKrw;

  const detail = raw.detail || {};
  const productDetailVO = detail.productDetailVO || {};
  const shopinfo = raw.shopinfo || {};
  const shop = shopinfo.shop || {};

  // 이미지 URL 수집
  const imageUrls: string[] = [];
  if (detail.sdiProductsPicList && Array.isArray(detail.sdiProductsPicList)) {
    for (const pic of detail.sdiProductsPicList) {
      if (pic.picture1) imageUrls.push(...normalizeImageUrl([pic.picture1]));
      if (pic.picture2) imageUrls.push(...normalizeImageUrl([pic.picture2]));
      if (pic.picture3) imageUrls.push(...normalizeImageUrl([pic.picture3]));
      if (pic.picture) imageUrls.push(...normalizeImageUrl([pic.picture]));
    }
  }

  // SKU 목록에서 옵션 파싱
  const options = parseSKUList(detail.productPropertySkuBoList || []);

  // 스펙 파싱
  const specs = parseSpecs(productDetailVO, raw.propertyList || []);

  // HTML 설명에서 텍스트 추출 (간단한 태그 제거)
  const descOriginal = stripHtmlTags(productDetailVO.detaill || '');

  return {
    id: String(productDetailVO.id || raw.id),
    titleOriginal: productDetailVO.title || '',
    titleKo: translations.title || '',
    descOriginal: descOriginal || undefined,
    descKo: translations.desc || undefined,
    priceOriginalCny: priceCny.toFixed(2),
    priceKrw: String(finalKrw),
    originalPriceKrw: String(baseKrw),
    minOrderQty: productDetailVO.startNumber || raw.startNum || 1,
    stock: undefined, // 상세 조회에서 총 재고는 없음 (SKU별 재고는 있음)
    imageUrls: imageUrls.length > 0 ? imageUrls : [],
    categoryId: undefined,
    shopId: String(shop.shopId || raw.shopId),
    shopName: shop.shopName || '',
    detailUrl: undefined,
    options: options.length > 0 ? options : undefined,
    optionsKo: undefined,
    specs: Object.keys(specs).length > 0 ? specs : undefined,
    weight: productDetailVO.freight ? String(productDetailVO.freight) : undefined,
    viewCount: 0,
    salesCount: parseInt(raw.dealQuantitys || '0', 10),
    wishlistCount: 0,
    reviewCount: 0,
    isActive: true,
    isFeatured: false,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 상대 경로 이미지 URL을 절대 URL로 정규화
 * - "http"로 시작하면 그대로 사용
 * - "i004/" 등의 상대 경로면 "https://img1.yiwugou.com/" 접두사 추가
 */
function normalizeImageUrl(urls: (string | undefined)[]): string[] {
  return urls
    .filter((url): url is string => !!url && typeof url === 'string')
    .map((url) => {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      // 상대 경로 처리
      return `https://img1.yiwugou.com/${url}`;
    });
}

/**
 * SKU 목록에서 ProductOption[] 파싱
 * productPropertySkuBoList에서 specificationNameOne/Two를 추출
 */
function parseSKUList(skuList: any[]): ProductOption[] {
  if (!skuList || skuList.length === 0) return [];

  const optionMap = new Map<string, Set<string>>();

  for (const sku of skuList) {
    if (sku.specificationNameOne) {
      if (!optionMap.has('specificationNameOne')) {
        optionMap.set('specificationNameOne', new Set());
      }
      optionMap.get('specificationNameOne')!.add(sku.specificationNameOne);
    }

    if (sku.specificationNameTwo) {
      if (!optionMap.has('specificationNameTwo')) {
        optionMap.set('specificationNameTwo', new Set());
      }
      optionMap.get('specificationNameTwo')!.add(sku.specificationNameTwo);
    }
  }

  const options: ProductOption[] = [];
  for (const [name, valuesSet] of optionMap) {
    const values: ProductOptionValue[] = Array.from(valuesSet).map((v) => ({
      value: v,
    }));
    options.push({
      name,
      values,
    });
  }

  return options;
}

/**
 * 제품 스펙 파싱
 */
function parseSpecs(
  productDetailVO: any,
  propertyList: any[],
): Record<string, string> {
  const specs: Record<string, string> = {};

  if (productDetailVO.metric) {
    specs['단위'] = productDetailVO.metric;
  }

  if (productDetailVO.startNumber) {
    specs['최소주문수량'] = String(productDetailVO.startNumber);
  }

  if (productDetailVO.freight) {
    specs['무게'] = `${productDetailVO.freight}g`;
  }

  if (productDetailVO.deliveryPromise) {
    const deliveryMap: Record<number, string> = {
      1: '24시간',
      2: '48시간',
      3: '72시간',
      7: '7일',
    };
    specs['배송시간'] = deliveryMap[productDetailVO.deliveryPromise] || '';
  }

  // propertyList에서 속성 추출
  if (propertyList && Array.isArray(propertyList)) {
    for (const prop of propertyList) {
      if (prop.pvalue && prop.cvalueList && Array.isArray(prop.cvalueList)) {
        specs[prop.pvalue] = prop.cvalueList.join(', ');
      }
    }
  }

  return specs;
}

/**
 * HTML 태그 제거 (간단한 구현)
 */
function stripHtmlTags(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
