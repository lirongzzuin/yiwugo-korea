import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const translationCache = new Map<string, string>();

const GLOSSARY: Record<string, string> = {
  '包邮': '무료배송', '爆款': '인기상품', '批发': '도매', '厂家直销': '공장직판',
  '现货': '즉시발송', '新款': '신상품', '热卖': '인기판매', '一件代发': '소량배송',
  '义乌': '이우', '地摊': '노점', '网红': '인플루언서', '同款': '동일상품',
  '国际商贸城': '국제상무도시',
};

function applyGlossary(text: string): string {
  let result = text;
  for (const [zh, ko] of Object.entries(GLOSSARY)) {
    result = result.replaceAll(zh, ko);
  }
  return result;
}

async function translateOne(text: string): Promise<string> {
  if (!text) return '';
  if (translationCache.has(text)) return translationCache.get(text)!;

  const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  if (chineseCount < text.length * 0.3) {
    const result = applyGlossary(text);
    translationCache.set(text, result);
    return result;
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.substring(0, 500))}&langpair=zh-CN|ko`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (res.ok) {
      const json = await res.json();
      let translated = json?.responseData?.translatedText || '';
      if (translated && translated !== text) {
        translated = applyGlossary(translated);
        translationCache.set(text, translated);
        return translated;
      }
    }
  } catch { /* fallback */ }

  const fallback = applyGlossary(text);
  translationCache.set(text, fallback);
  return fallback;
}

/**
 * POST /api/translate/batch
 * Body: { texts: string[] }
 * Response: { translations: string[] }
 *
 * Translates multiple texts in parallel (max 20 at a time).
 */
export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    // Limit to 50 texts per request (product detail can have many SKU+specs)
    const toTranslate = texts.slice(0, 50);

    // Translate in parallel
    const translations = await Promise.all(
      toTranslate.map((text: string) => translateOne(text))
    );

    return NextResponse.json({ translations });
  } catch {
    return NextResponse.json({ translations: [] }, { status: 500 });
  }
}
