import { normalizeImageUrl } from '../../lib/yiwugo-server';

const GLOSSARY: Record<string, string> = {
  '包邮': '무료배송', '爆款': '인기상품', '批发': '도매', '厂家直销': '공장직판',
  '现货': '즉시발송', '新款': '신상품', '热卖': '인기판매', '一件代发': '소량배송',
  '义乌': '이우', '地摊': '노점', '网红': '인플루언서', '同款': '동일상품',
};

function applyGlossary(text: string): string {
  let result = text;
  for (const [zh, ko] of Object.entries(GLOSSARY)) {
    result = result.replaceAll(zh, ko);
  }
  return result;
}

// Simple server-side translation cache
const transCache = new Map<string, string>();

async function translateText(text: string): Promise<string> {
  if (!text) return '';
  const cacheKey = text.substring(0, 100);
  if (transCache.has(cacheKey)) return transCache.get(cacheKey)!;

  const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseCharCount < text.length * 0.3) {
    const result = applyGlossary(text);
    transCache.set(cacheKey, result);
    return result;
  }

  try {
    // Send original Chinese text to translation API first, then apply glossary
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=zh-CN|ko`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const json = await res.json();
      let translated = json?.responseData?.translatedText || '';
      if (translated && translated !== text) {
        // Apply glossary on translated result for fine-tuning
        translated = applyGlossary(translated);
        transCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch { /* fallback */ }

  const fallback = applyGlossary(text);
  transCache.set(cacheKey, fallback);
  return fallback;
}

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

// Translate a batch of mapped products (translate names)
export async function translateProducts(products: any[]): Promise<any[]> {
  const results = await Promise.all(
    products.map(async (p) => {
      const translatedName = await translateText(p.name);
      return { ...p, name: translatedName };
    })
  );
  return results;
}
