import { useCallback, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type ActionType = 'VIEW' | 'CLICK' | 'WISHLIST' | 'CART' | 'PURCHASE' | 'SEARCH';

/**
 * 사용자 행동을 비동기로 서버에 기록하는 훅
 * - navigator.sendBeacon 또는 fetch로 fire-and-forget 전송
 * - 동일 상품 중복 조회 방지 (세션 내)
 * - 서비스 속도에 전혀 영향 없음
 */
export function useActivityTracker() {
  const trackedRef = useRef(new Set<string>());

  const track = useCallback(
    (
      actionType: ActionType,
      productId?: string,
      categoryId?: string,
      metadata?: Record<string, any>,
    ) => {
      // VIEW 중복 방지: 같은 세션에서 같은 상품을 여러 번 기록하지 않음
      if (actionType === 'VIEW' && productId) {
        const key = `${actionType}:${productId}`;
        if (trackedRef.current.has(key)) return;
        trackedRef.current.add(key);
      }

      const body = JSON.stringify({
        actionType,
        productId,
        categoryId,
        metadata,
      });

      // sendBeacon이 있으면 사용 (페이지 이탈 시에도 전송 보장)
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(`${API_URL}/recommendations/track`, blob);
        return;
      }

      // fallback: fire-and-forget fetch
      fetch(`${API_URL}/recommendations/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        credentials: 'include',
        keepalive: true,
      }).catch(() => {
        // 추적 실패는 무시
      });
    },
    [],
  );

  return { track };
}
