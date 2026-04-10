import { useState, useEffect, useCallback, useRef } from 'react';
import type { Product, ProductSearchParams, ProductSearchResult } from '@yiwugo/shared';

const API_BASE_URL =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : '';

interface UseProductSearchReturn {
  data: ProductSearchResult | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UseProductDetailReturn {
  product: Product | null;
  isLoading: boolean;
  error: string | null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Search products with query params.
 * Automatically fetches on param change.
 */
export function useProductSearch(
  params: ProductSearchParams,
): UseProductSearchReturn {
  const [data, setData] = useState<ProductSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      const p = paramsRef.current;
      if (p.q) searchParams.set('q', p.q);
      if (p.categoryId) searchParams.set('categoryId', p.categoryId);
      if (p.page != null) searchParams.set('page', String(p.page));
      if (p.pageSize != null) searchParams.set('pageSize', String(p.pageSize));
      if (p.sortBy) searchParams.set('sortBy', p.sortBy);
      if (p.minPrice != null) searchParams.set('minPrice', String(p.minPrice));
      if (p.maxPrice != null) searchParams.set('maxPrice', String(p.maxPrice));
      if (p.shopId) searchParams.set('shopId', p.shopId);

      const qs = searchParams.toString();
      const result = await apiFetch<ProductSearchResult>(
        `/api/v1/products${qs ? `?${qs}` : ''}`,
      );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refetch when params change (serialized comparison)
  const serialized = JSON.stringify(params);
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized]);

  return { data, isLoading, error, refetch: fetchData };
}

/**
 * Fetch a single product by ID.
 */
export function useProductDetail(id: string): UseProductDetailReturn {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    apiFetch<Product>(`/api/v1/products/${id}`)
      .then((data) => {
        if (!cancelled) setProduct(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to fetch product');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, isLoading, error };
}
