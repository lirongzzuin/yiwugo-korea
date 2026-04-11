import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple in-memory cache for translations
const translationCache = new Map<string, string>();

// Common Chinese→Korean product term glossary for better translations
const GLOSSARY: Record<string, string> = {
  '包邮': '무료배송',
  '爆款': '인기상품',
  '批发': '도매',
  '厂家直销': '공장직판',
  '现货': '즉시발송',
  '新款': '신상품',
  '热卖': '인기판매',
  '一件代发': '소량배송',
  '义乌': '이우',
  '国际商贸城': '국제상무도시',
  '楼': '층',
  '街': '가',
  '门': '동',
  '双': '켤레',
  '个': '개',
  '件': '벌',
  '克': 'g',
  '千克': 'kg',
  '箱': '박스',
  '套': '세트',
  '条': '개',
  '只': '개',
  '把': '개',
  '块': '개',
  '片': '장',
  '包': '팩',
  '卷': '롤',
  '米': 'm',
  '厘米': 'cm',
  '毫米': 'mm',
};

function applyGlossary(text: string): string {
  let result = text;
  for (const [zh, ko] of Object.entries(GLOSSARY)) {
    result = result.replaceAll(zh, ko);
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const text = request.nextUrl.searchParams.get('text') || '';
    if (!text.trim()) {
      return NextResponse.json({ translated: '', original: '' });
    }

    // Check cache
    const cacheKey = text.trim();
    if (translationCache.has(cacheKey)) {
      return NextResponse.json({ translated: translationCache.get(cacheKey), original: text });
    }

    // Check if text is mostly non-Chinese (already Korean/English)
    const chineseCharCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    if (chineseCharCount < text.length * 0.3) {
      // Not primarily Chinese, apply glossary only
      const result = applyGlossary(text);
      return NextResponse.json({ translated: result, original: text });
    }

    // Apply glossary first
    const glossaryApplied = applyGlossary(text);

    // Use MyMemory free translation API (no key needed)
    try {
      const res = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(glossaryApplied)}&langpair=zh-CN|ko`,
        { next: { revalidate: 86400 } } // cache for 24 hours
      );
      if (res.ok) {
        const json = await res.json();
        const translated = json?.responseData?.translatedText || glossaryApplied;
        translationCache.set(cacheKey, translated);
        return NextResponse.json({ translated, original: text });
      }
    } catch {
      // fallback to glossary-only
    }

    // Fallback: glossary only
    translationCache.set(cacheKey, glossaryApplied);
    return NextResponse.json({ translated: glossaryApplied, original: text });
  } catch (error) {
    return NextResponse.json({ translated: '', original: '', error: 'Translation failed' });
  }
}
