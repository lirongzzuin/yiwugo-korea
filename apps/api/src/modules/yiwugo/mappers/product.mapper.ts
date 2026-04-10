import {
  YiwugoRawProduct,
  Product,
  ProductOption,
  ProductOptionValue,
} from '@yiwugo/shared';

interface Translations {
  title: string;
  desc: string;
  options: string;
}

/**
 * Map raw Yiwugo API product data to normalized Product format
 *
 * @param raw - Raw product from Yiwugo API
 * @param translations - Translated text (title, desc, options)
 * @param exchangeRate - CNY → KRW exchange rate (e.g. 190.5)
 * @param commissionRate - Commission rate as decimal (e.g. 0.08 for 8%)
 */
export function mapRawToProduct(
  raw: YiwugoRawProduct,
  translations: Translations,
  exchangeRate: number,
  commissionRate: number,
): Product {
  const priceCny = parseFloat(raw.price) || 0;
  const baseKrw = Math.round(priceCny * exchangeRate);
  const commissionKrw = Math.round(baseKrw * commissionRate);
  const finalKrw = baseKrw + commissionKrw;

  // Parse options from props_name (format: "颜色:黑色;尺寸:大号")
  const options = parseOptions(raw.props_name);
  const optionsKo = parseOptions(translations.options);

  // Parse specs from SKU list
  const specs = parseSpecs(raw);

  // Collect all image URLs
  const imageUrls: string[] = [];
  if (raw.pic_url) imageUrls.push(raw.pic_url);
  if (raw.item_imgs) {
    for (const img of raw.item_imgs) {
      if (img.url && !imageUrls.includes(img.url)) {
        imageUrls.push(img.url);
      }
    }
  }

  return {
    id: raw.num_iid,
    titleOriginal: raw.title,
    titleKo: translations.title,
    descOriginal: raw.desc,
    descKo: translations.desc || undefined,
    priceOriginalCny: priceCny.toFixed(2),
    priceKrw: String(finalKrw),
    originalPriceKrw: String(baseKrw),
    minOrderQty: raw.min_order_qty ?? 1,
    stock: raw.stock,
    imageUrls,
    categoryId: raw.category_id,
    subCategoryId: raw.sub_category_id,
    shopId: raw.seller_id,
    shopName: raw.shop_name,
    detailUrl: raw.detail_url,
    options: options.length > 0 ? options : undefined,
    optionsKo: optionsKo.length > 0 ? optionsKo : undefined,
    specs: specs || undefined,
    weight: raw.weight,
    viewCount: raw.view_count ?? 0,
    salesCount: raw.sales_count ?? 0,
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
 * Parse options string "颜色:黑色,白色;尺寸:大号,小号" into structured format
 */
function parseOptions(propsName: string): ProductOption[] {
  if (!propsName) return [];

  const options: ProductOption[] = [];
  const groups = propsName.split(';').filter(Boolean);

  for (const group of groups) {
    const [name, valuesStr] = group.split(':');
    if (!name || !valuesStr) continue;

    const values: ProductOptionValue[] = valuesStr
      .split(',')
      .filter(Boolean)
      .map((v) => ({ value: v.trim() }));

    options.push({
      name: name.trim(),
      values,
    });
  }

  return options;
}

/**
 * Extract specs from raw product data
 */
function parseSpecs(raw: YiwugoRawProduct): Record<string, string> | undefined {
  const specs: Record<string, string> = {};

  if (raw.weight) specs['重量'] = raw.weight;
  if (raw.min_order_qty) specs['最小起订量'] = `${raw.min_order_qty}`;
  if (raw.stock) specs['库存'] = `${raw.stock}`;

  // Parse any additional props from props_name
  if (raw.props_name) {
    const groups = raw.props_name.split(';').filter(Boolean);
    for (const group of groups) {
      const [key, value] = group.split(':');
      if (key && value) {
        specs[key.trim()] = value.trim();
      }
    }
  }

  return Object.keys(specs).length > 0 ? specs : undefined;
}
