import { useState, useCallback, useRef } from 'react';

export interface UseInfiniteScrollOptions<T> {
  fetchFn: (params: { cursor?: string; pageSize: number }) => Promise<{
    items: T[];
    nextCursor?: string | null;
    hasMore: boolean;
  }>;
  pageSize?: number;
}

export interface UseInfiniteScrollReturn<T> {
  items: T[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  reset: () => void;
}

/**
 * Cursor-based infinite scroll hook.
 * Uses a cursor string to track pagination position.
 */
export function useInfiniteScroll<T>({
  fetchFn,
  pageSize = 20,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const cursorRef = useRef<string | undefined>(undefined);
  const isFetchingRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;

    isFetchingRef.current = true;
    setIsLoading(true);

    try {
      const result = await fetchFn({
        cursor: cursorRef.current,
        pageSize,
      });

      setItems((prev) => [...prev, ...result.items]);
      cursorRef.current = result.nextCursor ?? undefined;
      setHasMore(result.hasMore);
    } catch {
      // Stop loading on error but preserve existing items
      setHasMore(false);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [fetchFn, pageSize, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setIsLoading(false);
    setHasMore(true);
    cursorRef.current = undefined;
    isFetchingRef.current = false;
  }, []);

  return { items, isLoading, hasMore, loadMore, reset };
}
