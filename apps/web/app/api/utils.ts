import { normalizeImageUrl } from '../../lib/yiwugo-server';

/**
 * Map raw Yiwugo product data to the frontend Product shape.
 * Compatible with ProductCard component interface.
 *
 * Yiwugo price fields:
 *   - Product list (prslist): sellPrice in 分 (cents) → divide by 100 for CNY
 *   - Shop product search (productdetaillist): sellPrice in 分 (cents)
 *   - Product detail: totalprice in 元 (yuan) → use directly
 */
export function mapProduct(raw: any, rate = 190) {
  // Determine CNY price from various possible fields
  let priceCny = 0;
  if (raw.totalprice) {
    priceCny = parseFloat(raw.totalprice);
  } else if (raw.sellPrice !== undefined) {
    const sellPrice = Number(raw.sellPrice);
    // sellPrice is in 分 (cents) — divide by 100 to get CNY
    priceCny = sellPrice / 100;
  }

  const priceKrw = Math.round(priceCny * rate * 1.05);

  // Normalize image URL
  const imageUrl = normalizeImageUrl(raw.picture1 || raw.imgUrl || raw.picUrl || '');

  return {
    id: String(raw.id || raw.productId || raw.num || ''),
    name: raw.title || raw.productName || raw.newtitle || '',
    imageUrl,
    category: raw.categoryName || '',
    priceKRW: priceKrw,
    priceCNY: Number(priceCny.toFixed(2)),
    moq: parseInt(raw.startNum || raw.smallNum || raw.beginNumber || '1', 10),
    salesCount: parseInt(raw.dealQuantitys || raw.dealQuantity || raw.sellCounts || '0', 10),
    shopName: raw.shopName || '',
    shopId: String(raw.shopId || ''),
    boothNumber: raw.boothNo || '',
    badge: null as 'TOP' | 'SALE' | 'HOT' | 'NEW' | null,
  };
}
