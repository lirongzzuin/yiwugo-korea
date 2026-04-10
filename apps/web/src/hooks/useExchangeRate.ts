'use client';

import { useState, useEffect } from 'react';

interface ExchangeRate {
  rate: number;
  change: number;
  changePercent: number;
  updatedAt: string;
  loading: boolean;
}

const FALLBACK_RATE = 186.42;

export function useExchangeRate(): ExchangeRate {
  const [rate, setRate] = useState<ExchangeRate>({
    rate: FALLBACK_RATE,
    change: 0.52,
    changePercent: 0.28,
    updatedAt: new Date().toISOString(),
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchRate() {
      try {
        const res = await fetch('/api/exchange-rate');
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (isMounted) {
          setRate({
            rate: data.rate ?? FALLBACK_RATE,
            change: data.change ?? 0,
            changePercent: data.changePercent ?? 0,
            updatedAt: data.updatedAt ?? new Date().toISOString(),
            loading: false,
          });
        }
      } catch {
        // Use fallback rate
        if (isMounted) {
          setRate((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    fetchRate();
    const interval = setInterval(fetchRate, 60000); // refresh every minute

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return rate;
}
