/**
 * Map raw Yiwugo product data to the frontend Product shape.
 * Compatible with ProductCard component interface.
 *
 * Yiwugo price fields:
 *   - Product list: sellPrice in 分 (cents) → divide by 100 for CNY
 *   - Product detail: totalprice in 元 (yuan) → use directly
 *   - Some products may have regular numeric prices
 */
export function mapProduct(raw: any, rate = 190) {
  // Determine CNY price from various possible fields
  let priceCny = 0;
  if (raw.totalprice) {
    priceCny = parseFloat(raw.totalprice);
  } else if (raw.sellPrice !== undefined) {
    const sellPrice = Number(raw.sellPrice);
    priceCny = sellPrice > 100 ? sellPrice / 100 : sellPrice;
  }

  const priceKrw = Math.round(priceCny * rate * 1.05);

  return {
    id: String(raw.productId || raw.num || raw.id || ''),
    name: raw.title || raw.productName || raw.newtitle || '',
    imageUrl: raw.imgUrl || raw.picUrl || raw.picture1 || '',
    category: raw.categoryName || '',
    priceKRW: priceKrw,
    priceCNY: Number(priceCny.toFixed(2)),
    moq: parseInt(raw.smallNum || raw.beginNumber || '1', 10),
    salesCount: parseInt(raw.dealQuantity || raw.dealQuantitys || '0', 10),
    shopName: raw.shopName || '',
    shopId: String(raw.shopId || ''),
    boothNumber: raw.boothNo || '',
    badge: null as 'TOP' | 'SALE' | 'HOT' | 'NEW' | null,
  };
}
