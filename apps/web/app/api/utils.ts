/**
 * Map raw Yiwugo product data to the frontend Product shape.
 * Compatible with ProductCard component interface.
 */
export function mapProduct(raw: any, rate = 180) {
  const sellPrice = Number(raw.sellPrice || 0);
  const priceCny = sellPrice > 100 ? sellPrice / 100 : sellPrice;
  const priceKrw = Math.round(priceCny * rate * 1.05);

  return {
    id: String(raw.productId || raw.num || raw.id || ''),
    name: raw.title || raw.productName || '',
    imageUrl: raw.imgUrl || raw.picUrl || raw.picture1 || '',
    category: raw.categoryName || '',
    priceKRW: priceKrw,
    priceCNY: Number(priceCny.toFixed(2)),
    moq: raw.smallNum || raw.beginNumber || 1,
    salesCount: raw.dealQuantity || raw.salesCount || 0,
    shopName: raw.shopName || '',
    shopId: String(raw.shopId || ''),
    boothNumber: raw.boothNo || '',
    badge: null as 'TOP' | 'SALE' | 'HOT' | 'NEW' | null,
  };
}
