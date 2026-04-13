/**
 * 통합 번역 서비스 (Vercel Serverless 최적화)
 *
 * 캐싱 전략:
 *   1. 인메모리 캐시 (같은 invocation 내 중복 제거)
 *   2. Next.js fetch cache (Vercel Data Cache) - 같은 URL은 자동 캐시, cold start에도 유지
 *   3. 용어사전 (API 호출 없이 즉시)
 *   4. MyMemory API (4초 타임아웃)
 *   5. 용어사전 폴백 (절대 실패 안 함)
 *
 * 핵심 포인트:
 * - fetch(url, { next: { revalidate } }) 옵션이 Vercel Data Cache를 자동 사용
 * - 같은 텍스트는 Vercel CDN에서 즉시 반환 (cold start에도 유지됨)
 * - unstable_cache는 dev 환경 이슈가 있어 사용하지 않음
 */

import { applyGlossary, hasChinese, chineseRatio } from './translation-glossary';

// ─── 설정 ───────────────────────────────────────────
const MEMORY_CACHE_MAX = 5000;
const API_TIMEOUT_MS = 2500; // MyMemory API 개별 타임아웃
const BATCH_TOTAL_BUDGET_MS = 4500; // translateBatch 전체 예산 (Vercel 10초 - yiwugo API 2초 - 버퍼)
const CACHE_REVALIDATE_SECONDS = 86400 * 7; // 7일

// ─── 인메모리 캐시 ──────────────────────────────────
const memoryCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

// ─── 캐시 키 생성 ───────────────────────────────────
function cacheKey(text: string): string {
  return text.trim().substring(0, 200);
}

// ─── MyMemory API 호출 (Next.js fetch 캐시 활용) ──────
async function callMyMemory(text: string): Promise<string | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    // 정규화된 URL을 사용 (fetch cache는 URL로 키 관리)
    const normalized = text.trim().substring(0, 500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      normalized,
    )}&langpair=zh-CN|ko`;

    const res = await fetch(url, {
      signal: controller.signal,
      // Next.js Data Cache - 7일간 같은 URL은 Vercel CDN에서 즉시 반환
      next: { revalidate: CACHE_REVALIDATE_SECONDS, tags: ['translation'] },
    });

    if (!res.ok) return null;

    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    if (translated && typeof translated === 'string' && translated !== normalized) {
      return translated;
    }
  } catch {
    // AbortError / 네트워크 에러 → null
  } finally {
    clearTimeout(timeoutId);
  }
  return null;
}

/**
 * 단일 텍스트 번역
 *
 * 폴백 체인:
 *   1. 빈 문자열 → 빈 문자열
 *   2. 중국어 없음 → 용어사전만 (즉시, 네트워크 없음)
 *   3. 메모리 캐시 히트 → 즉시
 *   4. 중복 요청 → 기존 Promise 재사용
 *   5. MyMemory API (Next.js fetch cache로 자동 캐시)
 *   6. 용어사전 폴백
 */
export async function translateText(text: string): Promise<string> {
  if (!text || text.length === 0) return '';

  // 중국어가 없으면 즉시 용어사전만
  if (!hasChinese(text)) {
    return applyGlossary(text);
  }

  const key = cacheKey(text);

  // 메모리 캐시 히트 (같은 invocation 내)
  const cached = memoryCache.get(key);
  if (cached) return cached;

  // 중복 요청 병합
  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      // 용어사전 먼저 적용
      const glossaryResult = applyGlossary(text);

      // 중국어 비율이 낮으면 용어사전만 반환
      if (chineseRatio(text) < 0.2) {
        return glossaryResult;
      }

      // MyMemory API 호출 (Next.js fetch cache가 자동으로 캐시)
      const apiResult = await callMyMemory(text);
      if (apiResult) {
        // API 결과에 용어사전 재적용 (전문용어 보정)
        return applyGlossary(apiResult);
      }

      // 실패 시 용어사전 폴백
      return glossaryResult;
    } catch {
      return applyGlossary(text);
    } finally {
      pendingRequests.delete(key);
    }
  })();

  // 메모리 캐시에도 Promise 결과 저장
  promise.then((result) => {
    if (memoryCache.size >= MEMORY_CACHE_MAX) {
      const toDelete = Array.from(memoryCache.keys()).slice(0, Math.floor(MEMORY_CACHE_MAX * 0.1));
      toDelete.forEach((k) => memoryCache.delete(k));
    }
    memoryCache.set(key, result);
  }).catch(() => {});

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * 배치 번역 - Promise.all로 병렬 처리
 *
 * 전체 예산 관리 (Vercel 10초 timeout 방지):
 * - 시작 시점부터 7초 budget
 * - 예산 내 완료되지 않으면 용어사전 폴백으로 즉시 반환
 */
export async function translateBatch(texts: string[]): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const limited = texts.slice(0, 100);

  // 전체 예산 타임아웃 (Promise.race)
  const budgetPromise = new Promise<string[]>((resolve) => {
    setTimeout(() => resolve(limited.map((t) => applyGlossary(t))), BATCH_TOTAL_BUDGET_MS);
  });

  const translatePromise = Promise.all(
    limited.map(async (text) => {
      try {
        return await translateText(text);
      } catch {
        return applyGlossary(text);
      }
    }),
  );

  // 번역 완료 vs 예산 초과 → 먼저 끝나는 쪽 사용
  return Promise.race([translatePromise, budgetPromise]);
}

/**
 * 동기 번역 (캐시 + 용어사전만, API 호출 없음)
 */
export function translateSync(text: string): string {
  if (!text) return '';
  const key = cacheKey(text);
  const cached = memoryCache.get(key);
  if (cached) return cached;
  return applyGlossary(text);
}

/**
 * 캐시 상태 조회 (디버그용)
 */
export function getCacheStats() {
  return {
    memorySize: memoryCache.size,
    maxSize: MEMORY_CACHE_MAX,
    cacheType: 'fetch-cache',
    fileExists: false,
  };
}

/**
 * 캐시 강제 flush (no-op - fetch cache는 자동 관리)
 */
export function flushCache(): void {
  // Next.js fetch cache는 자동 관리됨
}
