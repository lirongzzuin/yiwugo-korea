import { NextRequest, NextResponse } from 'next/server';
import * as yiwugo from '../../../../lib/yiwugo-server';
import { translateBatch, getCacheStats, flushCache } from '../../../../lib/translation-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/cron/prefetch-translations
 *
 * 주기적 번역 프리페치 엔드포인트
 * - 인기 상품 / 신상품 / 주요 카테고리 데이터를 미리 로드
 * - 상품명, 상점명 등을 캐시에 선제적으로 번역
 * - 사용자 요청 시 즉시 응답 가능
 *
 * 사용법:
 * 1. Vercel Cron Jobs: vercel.json에 등록
 * 2. 외부 cron: curl 주기적 호출
 * 3. 수동 실행: 브라우저에서 직접 호출
 *
 * 보안:
 * - CRON_SECRET 환경변수 설정 시 Authorization 헤더 검증
 * - 없으면 누구나 호출 가능 (개발/데모 용도)
 */
export async function GET(request: NextRequest) {
  // 선택적 인증
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const startTime = Date.now();
  const results = {
    startTime: new Date().toISOString(),
    fetchedProducts: 0,
    translatedTexts: 0,
    errors: [] as string[],
    elapsed: 0,
    cacheStatsBefore: getCacheStats(),
    cacheStatsAfter: null as any,
  };

  try {
    // 1. 인기 상품 페이지 1-3 프리페치
    const allTexts: Set<string> = new Set();

    for (let page = 1; page <= 3; page++) {
      try {
        const popular = await yiwugo.searchProducts({
          st: 9, // 판매량순
          cpage: page,
          pageSize: 24,
        });

        const products = popular.products || [];
        results.fetchedProducts += products.length;

        products.forEach((p: any) => {
          if (p.title) allTexts.add(p.title);
          if (p.shopName) allTexts.add(p.shopName);
        });
      } catch (err) {
        results.errors.push(`popular page ${page}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // 2. 신상품도 프리페치
    try {
      const newest = await yiwugo.searchProducts({
        cpage: 1,
        pageSize: 24,
      });
      const products = newest.products || [];
      results.fetchedProducts += products.length;
      products.forEach((p: any) => {
        if (p.title) allTexts.add(p.title);
        if (p.shopName) allTexts.add(p.shopName);
      });
    } catch (err) {
      results.errors.push(`newest: ${err instanceof Error ? err.message : 'unknown'}`);
    }

    // 3. 주요 카테고리별 프리페치 (상위 5개만)
    const topCategories = ['玩具', '服饰', '饰品', '数码', '百货'];
    for (const cat of topCategories) {
      try {
        const catProducts = await yiwugo.searchProducts({
          q: cat,
          cpage: 1,
          pageSize: 12,
        });
        const products = catProducts.products || [];
        results.fetchedProducts += products.length;
        products.forEach((p: any) => {
          if (p.title) allTexts.add(p.title);
        });
      } catch (err) {
        results.errors.push(`category ${cat}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // 4. 일괄 번역 (캐시에 저장)
    const textsArray = Array.from(allTexts);
    const batchSize = 50;
    for (let i = 0; i < textsArray.length; i += batchSize) {
      const batch = textsArray.slice(i, i + batchSize);
      try {
        await translateBatch(batch);
        results.translatedTexts += batch.length;
      } catch (err) {
        results.errors.push(`translate batch ${i}: ${err instanceof Error ? err.message : 'unknown'}`);
      }
    }

    // 5. 캐시 강제 flush
    flushCache();
    results.cacheStatsAfter = getCacheStats();
  } catch (error) {
    results.errors.push(`global: ${error instanceof Error ? error.message : 'unknown'}`);
  }

  results.elapsed = Date.now() - startTime;
  return NextResponse.json(results);
}

/**
 * POST /api/cron/prefetch-translations
 * 직접 텍스트 배열을 받아서 선제 번역
 * Body: { texts: string[] }
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const body = await request.json();
    const texts = Array.isArray(body?.texts) ? body.texts : [];

    if (texts.length === 0) {
      return NextResponse.json({ translated: 0, cacheStats: getCacheStats() });
    }

    await translateBatch(texts);
    flushCache();

    return NextResponse.json({
      translated: texts.length,
      cacheStats: getCacheStats(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
