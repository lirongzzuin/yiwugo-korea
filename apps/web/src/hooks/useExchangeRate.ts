'use client';
import { useState, useEffect, useCallback } from 'react';

export interface ExchangeRate {
  baseRate: number;       // 매매기준율 (수수료 미포함)
  rate: number;           // 결제 적용 환율 (수수료 포함)
  feeRate: number;        // 해외결제 수수료율
  change: number;
  changePercent: number;
  lastUpdated: string;
  source: string;
}

/**
 * 결제 기준 환율 훅
 *
 * 환율 소스: 한국수출입은행 매매기준율 → 국제환율기준 → 폴백
 * 결제 적용 환율 = 매매기준율 + 해외결제 수수료(1.5%)
 * - 토스페이먼츠/카드사가 해외결제 시 적용하는 수수료 구조와 동일
 */
export function useExchangeRate() {
  const [data, setData] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = useCallback(async () => {
    try {
      // 자체 API 호출 (한국수출입은행 → 국제환율 → 폴백)
      const res = await fetch('/api/exchange-rate/current', {
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.rate) {
          const prevRate = parseFloat(localStorage.getItem('yiwugo_prev_rate') || '0');
          const change = prevRate > 0 ? json.rate - prevRate : 0;
          const changePercent = prevRate > 0 ? (change / prevRate) * 100 : 0;

          localStorage.setItem('yiwugo_prev_rate', json.rate.toString());
          localStorage.setItem('yiwugo_rate_updated', json.updatedAt);

          setData({
            baseRate: json.baseRate || json.rate,
            rate: Math.round(json.rate * 100) / 100,
            feeRate: json.feeRate || 0.015,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            lastUpdated: json.updatedAt,
            source: json.source || '',
          });
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      throw new Error('API 응답 없음');
    } catch {
      // 폴백: 캐시된 값 사용
      const cachedRate = parseFloat(localStorage.getItem('yiwugo_prev_rate') || '0');
      if (cachedRate > 0) {
        setData({
          baseRate: cachedRate / 1.015,
          rate: cachedRate,
          feeRate: 0.015,
          change: 0,
          changePercent: 0,
          lastUpdated: localStorage.getItem('yiwugo_rate_updated') || new Date().toISOString(),
          source: '캐시',
        });
      } else {
        // 최종 폴백
        setData({
          baseRate: 195,
          rate: Math.round(195 * 1.015 * 100) / 100,
          feeRate: 0.015,
          change: 0,
          changePercent: 0,
          lastUpdated: new Date().toISOString(),
          source: '기본환율',
        });
      }
      setError('환율 정보를 불러올 수 없습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRate();
    // 5분마다 갱신
    const interval = setInterval(fetchRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchRate]);

  const convertCnyToKrw = useCallback((cny: number) => {
    if (!data) return 0;
    return Math.round(cny * data.rate);
  }, [data]);

  return { data, isLoading, error, refetch: fetchRate, convertCnyToKrw };
}
