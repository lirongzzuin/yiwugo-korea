'use client';
import { useState, useEffect, useCallback } from 'react';

interface ExchangeRate {
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  source: string;
}

export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      let rate: number | null = null;
      let source = '';

      // 1. Try exchangerate.host (free, no key)
      try {
        const res = await fetch('https://api.exchangerate.host/latest?base=CNY&symbols=KRW');
        if (res.ok) {
          const json = await res.json();
          if (json.rates?.KRW) {
            rate = json.rates.KRW;
            source = 'exchangerate.host';
          }
        }
      } catch {
        // silently fall through
      }

      // 2. Fallback: open.er-api.com (free)
      if (!rate) {
        try {
          const res = await fetch('https://open.er-api.com/v6/latest/CNY');
          if (res.ok) {
            const json = await res.json();
            if (json.rates?.KRW) {
              rate = json.rates.KRW;
              source = 'open.er-api.com';
            }
          }
        } catch {
          // silently fall through
        }
      }

      // 3. Final fallback
      if (!rate) {
        rate = 190.5;
        source = 'fallback';
      }

      // Calculate change from stored previous rate
      const prevRate = parseFloat(localStorage.getItem('yiwugo_prev_rate') || '0');
      const change = prevRate > 0 ? rate - prevRate : 0;
      const changePercent = prevRate > 0 ? (change / prevRate) * 100 : 0;

      localStorage.setItem('yiwugo_prev_rate', rate.toString());
      localStorage.setItem('yiwugo_rate_updated', new Date().toISOString());

      setData({
        rate: Math.round(rate * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        lastUpdated: new Date().toISOString(),
        source,
      });
      setError(null);
    } catch {
      setError('환율 정보를 불러올 수 없습니다');
      // Use cached rate
      const cachedRate = parseFloat(localStorage.getItem('yiwugo_prev_rate') || '190.5');
      setData({
        rate: cachedRate,
        change: 0,
        changePercent: 0,
        lastUpdated: localStorage.getItem('yiwugo_rate_updated') || new Date().toISOString(),
        source: 'cache',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
    // Refresh every 5 minutes
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  const convertCnyToKrw = useCallback((cny: number) => {
    if (!data) return 0;
    return Math.round(cny * data.rate);
  }, [data]);

  return { data, isLoading, error, refetch: fetchRate, convertCnyToKrw };
}
