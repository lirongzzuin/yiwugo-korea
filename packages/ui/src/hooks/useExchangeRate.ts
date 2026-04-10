import { useState, useEffect, useCallback, useRef } from 'react';

interface ExchangeRateData {
  rate: number;
  lastUpdated: string;
}

interface UseExchangeRateReturn {
  rate: number | null;
  lastUpdated: string | null;
  isLoading: boolean;
  convertCnyToKrw: (cny: number) => number;
  formattedRate: string;
}

const API_BASE_URL =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : '';

/**
 * Hook to fetch and use the current CNY-KRW exchange rate.
 * Caches the rate in memory and provides conversion utilities.
 */
export function useExchangeRate(): UseExchangeRateReturn {
  const [data, setData] = useState<ExchangeRateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchRate = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/exchange-rate/current`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData({
          rate: json.rate,
          lastUpdated: json.lastUpdated ?? json.updated_at ?? new Date().toISOString(),
        });
      } catch {
        // Fallback rate for offline / error scenarios
        setData({
          rate: 190,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRate();
  }, []);

  const convertCnyToKrw = useCallback(
    (cny: number): number => {
      if (!data) return 0;
      return Math.round(cny * data.rate);
    },
    [data],
  );

  const formattedRate = data
    ? `1 CNY = ${data.rate.toLocaleString('ko-KR')} KRW`
    : '-';

  return {
    rate: data?.rate ?? null,
    lastUpdated: data?.lastUpdated ?? null,
    isLoading,
    convertCnyToKrw,
    formattedRate,
  };
}
