/**
 * Next.js Instrumentation (서버 시작 시 실행)
 *
 * - 번역 캐시 웜업: 서버 재시작 시 인기 상품 프리페치
 * - Vercel serverless 환경에서는 cold start마다 실행되면 오히려 독이 되므로
 *   개발 환경 또는 장기 실행 서버에서만 동작
 * - 비동기로 실행되어 서버 시작을 블록하지 않음
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // Vercel 환경 감지: 프로덕션 serverless에서는 웜업 건너뛰기
  const isVercelServerless = process.env.VERCEL === '1';
  const isDev = process.env.NODE_ENV === 'development';
  const skipWarmup = process.env.SKIP_WARMUP === '1';

  if (skipWarmup || isVercelServerless) {
    // Vercel은 Next.js Data Cache가 cold start에도 지속되므로 웜업 불필요
    return;
  }

  if (!isDev) return; // 개발 환경에서만 자동 웜업

  // 동적 import로 클라이언트 번들 영향 제거
  const { warmupTranslationCache } = await import('./lib/warmup');
  warmupTranslationCache().catch((err) => {
    console.warn('[warmup] Translation warmup failed:', err);
  });
}
