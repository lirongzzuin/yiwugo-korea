/**
 * Next.js Instrumentation (서버 시작 시 실행)
 *
 * - 번역 캐시 웜업: 서버 재시작 시 인기 상품 프리페치
 * - 개발/프로덕션 환경 모두에서 동작
 * - 비동기로 실행되어 서버 시작을 블록하지 않음
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  // 동적 import로 클라이언트 번들 영향 제거
  const { warmupTranslationCache } = await import('./lib/warmup');

  // 비동기 백그라운드 실행 (서버 블록 안 함)
  warmupTranslationCache().catch((err) => {
    console.warn('[warmup] Translation warmup failed:', err);
  });
}
