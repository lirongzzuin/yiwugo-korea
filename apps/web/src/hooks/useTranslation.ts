'use client';

/**
 * 번역 훅 (pass-through 모드)
 *
 * 서버사이드에서 mapProductsAsync가 이미 100% 번역된 데이터를 보내므로
 * 이 훅은 더 이상 클라이언트 사이드 번역 API 호출을 하지 않습니다.
 *
 * 호환성을 위해 훅 자체는 남겨두어 기존 컴포넌트를 수정할 필요가 없습니다.
 * 과거에 발생했던 "중국어 → 한국어 점프 현상"이 완전히 제거됩니다.
 */

export function useTranslatedProducts<T>(products: T[]): T[] {
  // 서버에서 이미 번역됨 → 그대로 반환
  return products;
}

export function useTranslatedText(text: string): string {
  // 서버사이드 번역에 의존
  return text;
}
