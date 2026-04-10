import { Shop } from '@yiwugo/shared';

interface Translations {
  name: string;
  description: string;
}

/**
 * 상점 목록 항목을 정규화된 Shop 형식으로 매핑
 * /open/cn_shop/list의 list[] 항목 사용
 *
 * @param raw - Yiwugo API의 원본 상점 데이터 (list item)
 * @param translations - 번역된 텍스트 (상점명, 설명)
 */
export function mapShopListItem(raw: any, translations: Translations): Shop {
  return {
    id: String(raw.shopId),
    nameOriginal: raw.shopName || '',
    nameKo: translations.name || '',
    boothNumber: raw.boothNo,
    description: raw.introduction,
    descriptionKo: translations.description || undefined,
    logoUrl: raw.pictureUrlA || raw.pictureUrlSa,
    productCount: 0, // list에서는 제품 수 정보 없음
    responseRate: undefined,
    yearsInBusiness: undefined,
    isVerified: false,
    syncedAt: new Date().toISOString(),
  };
}

/**
 * 상점 상세 정보를 정규화된 Shop 형식으로 매핑
 * /open/cn_shop/detail 응답 사용
 *
 * @param raw - Yiwugo API의 상점 상세 응답
 * @param translations - 번역된 텍스트 (상점명, 설명)
 */
export function mapShopDetail(raw: any, translations: Translations): Shop {
  const shop = raw.shopinfo || raw.shop || raw;
  const shopbooth = raw.shopbooth || shop.shopbooth || {};

  return {
    id: String(shop.shopId),
    nameOriginal: shop.shopName || '',
    nameKo: translations.name || '',
    boothNumber: shopbooth.boothNo || shop.boothNo,
    description: shop.introduction || shop.description,
    descriptionKo: translations.description || undefined,
    logoUrl: shop.shopImageUrl || shop.pictureUrlA || shop.pictureUrlSa,
    panoramaUrl: shop.panoramaUrl,
    productCount: 0, // API가 직접 제공하지 않음
    responseRate: undefined,
    yearsInBusiness: undefined,
    isVerified: false,
    categories: undefined,
    syncedAt: new Date().toISOString(),
  };
}
