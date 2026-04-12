/**
 * 서버 시작 시 번역 캐시 웜업
 *
 * - 이우고 API에서 인기 상품 프리페치
 * - 상품명을 미리 번역하여 파일 캐시에 저장
 * - 첫 사용자 요청 시 즉시 한국어 응답 가능
 *
 * 실행 조건:
 * - 프로덕션: 항상 실행
 * - 개발: SKIP_WARMUP=1 설정 시 건너뜀
 */

import * as yiwugo from './yiwugo-server';
import { translateBatch, getCacheStats, flushCache } from './translation-service';

let isWarming = false;
let lastWarmupTime = 0;
const WARMUP_COOLDOWN_MS = 10 * 60 * 1000; // 10분

export async function warmupTranslationCache(): Promise<void> {
  if (process.env.SKIP_WARMUP === '1') {
    console.log('[warmup] Skipped (SKIP_WARMUP=1)');
    return;
  }

  // 이중 실행 방지
  if (isWarming) return;
  if (Date.now() - lastWarmupTime < WARMUP_COOLDOWN_MS) {
    console.log('[warmup] Skipped (cooldown)');
    return;
  }

  isWarming = true;
  const startTime = Date.now();

  try {
    const statsBefore = getCacheStats();
    console.log(`[warmup] Starting (cache: ${statsBefore.memorySize} entries)`);

    const allTexts = new Set<string>();

    // 1. 인기 상품 2페이지 (48개)
    for (let page = 1; page <= 2; page++) {
      try {
        const result = await yiwugo.searchProducts({
          st: 9, // 판매량순
          cpage: page,
          pageSize: 24,
        });
        (result.products || []).forEach((p: any) => {
          if (p.title) allTexts.add(p.title);
          if (p.shopName) allTexts.add(p.shopName);
        });
      } catch {
        // 실패해도 다음 페이지 진행
      }
    }

    // 2. 주요 카테고리 3개 (완구, 의류, 액세서리)
    const priorityKeywords = ['玩具', '服饰', '饰品'];
    for (const kw of priorityKeywords) {
      try {
        const result = await yiwugo.searchProducts({
          q: kw,
          cpage: 1,
          pageSize: 12,
        });
        (result.products || []).forEach((p: any) => {
          if (p.title) allTexts.add(p.title);
        });
      } catch {
        // 실패해도 다음 진행
      }
    }

    // 3. 배치 번역 (캐시에 저장)
    const texts = Array.from(allTexts);
    if (texts.length > 0) {
      // 50개씩 나눠서 번역 (API 부하 분산)
      const BATCH_SIZE = 50;
      for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);
        try {
          await translateBatch(batch);
        } catch {
          // 부분 실패 허용
        }
      }
    }

    // 4. 파일 캐시 강제 flush
    flushCache();

    const statsAfter = getCacheStats();
    const elapsed = Date.now() - startTime;
    console.log(
      `[warmup] Completed in ${elapsed}ms (cache: ${statsBefore.memorySize} → ${statsAfter.memorySize}, +${statsAfter.memorySize - statsBefore.memorySize})`,
    );

    lastWarmupTime = Date.now();
  } catch (error) {
    console.error('[warmup] Failed:', error);
  } finally {
    isWarming = false;
  }
}
