/**
 * 통합 번역 서비스
 *
 * 아키텍처:
 *   1. 메모리 캐시 (가장 빠름)
 *   2. 파일 캐시 (.next/cache - 서버 재시작 시에도 유지)
 *   3. 용어사전 적용 (API 호출 없이 즉시)
 *   4. MyMemory API (타임아웃 3초)
 *   5. 원문 폴백
 *
 * 특징:
 * - 서버 재시작해도 파일 캐시로 번역 유지
 * - 용어사전만으로 80%+ 번역 커버
 * - API 실패해도 글로사리 폴백으로 차단
 * - 중복 요청 병합 (같은 텍스트 동시 요청 시 1번만 API 호출)
 * - Node.js 런타임 전용 (Edge Runtime에서는 파일 캐시 비활성화)
 */

import { applyGlossary, hasChinese, chineseRatio } from './translation-glossary';

// ─── 캐시 설정 ───────────────────────────────────────
const MEMORY_CACHE_MAX = 10000;
const API_TIMEOUT_MS = 3000;
const CACHE_FILE_NAME = 'translations.json';

// ─── 메모리 캐시 ─────────────────────────────────────
const memoryCache = new Map<string, string>();
const pendingRequests = new Map<string, Promise<string>>();

// ─── 파일 캐시 (Node.js runtime only) ────────────────
let fileCacheLoaded = false;
let fileCacheDirty = false;
let lastFlushTime = 0;
const FLUSH_INTERVAL_MS = 60_000;

// Node.js 전용 모듈을 런타임에만 조건부 로드 (webpack이 Edge에서도 번들하지 않도록)
function getNodeFs(): any {
  if (typeof process === 'undefined' || !process.versions?.node) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    return eval('require')('fs');
  } catch {
    return null;
  }
}
function getNodePath(): any {
  if (typeof process === 'undefined' || !process.versions?.node) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    return eval('require')('path');
  } catch {
    return null;
  }
}

function getCacheFile(): string | null {
  const path = getNodePath();
  if (!path) return null;
  return path.join(process.cwd(), '.next', 'cache', CACHE_FILE_NAME);
}

function loadFileCache(): void {
  if (fileCacheLoaded) return;
  fileCacheLoaded = true;

  const fs = getNodeFs();
  const cacheFile = getCacheFile();
  if (!fs || !cacheFile) return;

  try {
    if (fs.existsSync(cacheFile)) {
      const content = fs.readFileSync(cacheFile, 'utf-8');
      const data = JSON.parse(content) as Record<string, string>;
      Object.entries(data).forEach(([k, v]) => {
        if (memoryCache.size < MEMORY_CACHE_MAX) {
          memoryCache.set(k, v);
        }
      });
      console.log(`[translation] Loaded ${memoryCache.size} cached translations`);
    }
  } catch (err) {
    console.warn('[translation] Failed to load cache file:', err);
  }
}

function flushFileCache(force = false): void {
  if (!fileCacheDirty && !force) return;
  const now = Date.now();
  if (!force && now - lastFlushTime < FLUSH_INTERVAL_MS) return;

  const fs = getNodeFs();
  const path = getNodePath();
  const cacheFile = getCacheFile();
  if (!fs || !path || !cacheFile) return;

  try {
    const dir = path.dirname(cacheFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const obj: Record<string, string> = {};
    memoryCache.forEach((v, k) => { obj[k] = v; });
    fs.writeFileSync(cacheFile, JSON.stringify(obj), 'utf-8');
    fileCacheDirty = false;
    lastFlushTime = now;
  } catch {
    // Vercel serverless 환경에서는 실패할 수 있으나 무시 (메모리 캐시는 여전히 동작)
  }
}

// 프로세스 종료 시 강제 flush
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', () => flushFileCache(true));
}

// ─── 캐시 키 생성 ───────────────────────────────────
function cacheKey(text: string): string {
  return text.trim().substring(0, 200);
}

// ─── 캐시 조회 / 저장 ────────────────────────────────
export function getCached(text: string): string | null {
  loadFileCache();
  const key = cacheKey(text);
  return memoryCache.get(key) || null;
}

export function setCached(text: string, translation: string): void {
  const key = cacheKey(text);

  // LRU 간단 구현: 최대 크기 초과 시 10% 삭제
  if (memoryCache.size >= MEMORY_CACHE_MAX) {
    const keysToDelete = Array.from(memoryCache.keys()).slice(0, Math.floor(MEMORY_CACHE_MAX * 0.1));
    keysToDelete.forEach((k) => memoryCache.delete(k));
  }

  memoryCache.set(key, translation);
  fileCacheDirty = true;

  // 비동기로 flush (throttle)
  setTimeout(() => flushFileCache(false), 0);
}

// ─── MyMemory API 호출 (타임아웃 포함) ──────────────────
async function callMyMemory(text: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      text.substring(0, 500),
    )}&langpair=zh-CN|ko`;

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    clearTimeout(timeoutId);

    if (!res.ok) return null;

    const json = await res.json();
    const translated = json?.responseData?.translatedText;
    if (translated && translated !== text) {
      return translated;
    }
  } catch {
    // 타임아웃 / 네트워크 오류 / rate limit → null
  }
  return null;
}

/**
 * 단일 텍스트 번역
 *
 * 폴백 체인:
 *   1. 메모리/파일 캐시 히트
 *   2. 중국어가 20% 미만이면 용어사전만 적용
 *   3. MyMemory API 호출 (3초 타임아웃)
 *   4. API 성공 시 결과에 용어사전 재적용
 *   5. 실패 시 용어사전 폴백
 */
export async function translateText(text: string): Promise<string> {
  if (!text || text.length === 0) return '';
  const key = cacheKey(text);

  // 1. 캐시 히트
  const cached = getCached(text);
  if (cached) return cached;

  // 2. 중국어 비율이 낮으면 용어사전만
  if (!hasChinese(text) || chineseRatio(text) < 0.2) {
    const result = applyGlossary(text);
    setCached(text, result);
    return result;
  }

  // 3. 중복 요청 병합
  const pending = pendingRequests.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      // 4. API 호출
      const apiResult = await callMyMemory(text);
      if (apiResult) {
        // 5. API 결과에 용어사전 재적용 (전문용어 보정)
        const finalResult = applyGlossary(apiResult);
        setCached(text, finalResult);
        return finalResult;
      }

      // 6. 폴백: 용어사전만
      const fallback = applyGlossary(text);
      setCached(text, fallback);
      return fallback;
    } finally {
      pendingRequests.delete(key);
    }
  })();

  pendingRequests.set(key, promise);
  return promise;
}

/**
 * 배치 번역 - Promise.all로 병렬 처리
 * 최대 100개까지 처리
 */
export async function translateBatch(texts: string[]): Promise<string[]> {
  if (!Array.isArray(texts) || texts.length === 0) return [];
  const limited = texts.slice(0, 100);
  return Promise.all(limited.map((t) => translateText(t)));
}

/**
 * 동기 번역 (캐시 + 용어사전만, API 호출 없음)
 * 매우 빠름 - 즉시 응답 필요 시 사용
 */
export function translateSync(text: string): string {
  if (!text) return '';
  const cached = getCached(text);
  if (cached) return cached;
  return applyGlossary(text);
}

/**
 * 캐시 상태 조회 (디버그용)
 */
export function getCacheStats() {
  loadFileCache();
  const fs = getNodeFs();
  const cacheFile = getCacheFile();
  return {
    memorySize: memoryCache.size,
    maxSize: MEMORY_CACHE_MAX,
    cacheFile: cacheFile || '(edge runtime)',
    fileExists: fs && cacheFile ? fs.existsSync(cacheFile) : false,
  };
}

/**
 * 캐시 강제 flush (외부에서 호출 가능)
 */
export function flushCache(): void {
  flushFileCache(true);
}
