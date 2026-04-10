import { YiwugoRawShop, Shop } from '@yiwugo/shared';

interface Translations {
  name: string;
  description: string;
}

/**
 * Map raw Yiwugo API shop data to normalized Shop format
 */
export function mapRawToShop(
  raw: YiwugoRawShop,
  translations: Translations,
): Shop {
  return {
    id: raw.seller_id,
    nameOriginal: raw.shop_name,
    nameKo: translations.name,
    boothNumber: raw.booth_number,
    description: raw.description,
    descriptionKo: translations.description || undefined,
    panoramaUrl: raw.panorama_url,
    logoUrl: raw.logo_url,
    productCount: raw.product_count ?? 0,
    responseRate: raw.response_rate,
    yearsInBusiness: raw.years_in_business,
    isVerified: raw.is_verified ?? false,
    categories: raw.categories,
    syncedAt: new Date().toISOString(),
  };
}
