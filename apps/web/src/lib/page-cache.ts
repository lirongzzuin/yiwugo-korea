'use client';

/**
 * 페이지 상태 sessionStorage 캐시 유틸리티
 *
 * 사용법:
 *   - savePageState(key, state): 페이지 이동 전 상태 저장
 *   - loadPageState(key): 페이지 복귀 시 상태 복원
 *   - clearPageState(key): 필요 시 삭제
 *
 * TTL: 5분 (이후 만료)
 * 세션 간에는 유지되지 않음 (탭 닫으면 삭제)
 */

const PREFIX = 'yiwugo:page:';
const TTL_MS = 5 * 60 * 1000; // 5분

interface CachedState<T> {
  data: T;
  timestamp: number;
  scrollY: number;
}

export function savePageState<T>(key: string, data: T, scrollY?: number): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CachedState<T> = {
      data,
      timestamp: Date.now(),
      scrollY: scrollY ?? window.scrollY,
    };
    sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // QuotaExceededError 등 무시
  }
}

export function loadPageState<T>(key: string): { data: T; scrollY: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CachedState<T>;

    // TTL 체크
    if (Date.now() - entry.timestamp > TTL_MS) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }

    return { data: entry.data, scrollY: entry.scrollY };
  } catch {
    return null;
  }
}

export function clearPageState(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // 무시
  }
}

export function clearAllPageStates(): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach((k) => {
      if (k.startsWith(PREFIX)) {
        sessionStorage.removeItem(k);
      }
    });
  } catch {
    // 무시
  }
}

/**
 * 스크롤 위치 복원 (다음 프레임에)
 */
export function restoreScrollPosition(y: number): void {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
  });
}
