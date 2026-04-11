import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * 환율 조회 API - 결제 시 적용되는 실제 환율 제공
 *
 * 환율 소스 우선순위:
 * 1. 한국수출입은행 API (공식 매매기준율) - KOREA_EXIM_API_KEY 필요
 * 2. open.er-api.com (중시장률 기반 무료 API)
 * 3. 하드코딩 폴백
 *
 * 결제 적용 환율 = 매매기준율(또는 중시장률) + 해외결제 수수료(1.5%)
 * - 이는 토스페이먼츠/카드사가 해외결제 시 적용하는 구조와 동일
 * - 한국수출입은행 매매기준율은 국내 모든 금융기관의 환율 산정 기준
 */

const OVERSEAS_PAYMENT_FEE_RATE = 0.015; // 해외결제 수수료 1.5% (카드사/PG 평균)

// 서버 인메모리 캐시 (5분)
let rateCache: { data: any; expiry: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFromKoreaExim(): Promise<{ rate: number; source: string } | null> {
  const apiKey = process.env.KOREA_EXIM_API_KEY;
  if (!apiKey) return null;

  try {
    // 한국수출입은행 현재환율 API
    // CNY 매매기준율 조회
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `https://www.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&searchdate=${today}&data=AP01`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const json = await res.json();
    if (!Array.isArray(json)) return null;

    // CNY 항목 찾기 (cur_unit: "CNH" 또는 "CNY")
    const cnyEntry = json.find((item: any) =>
      item.cur_unit === 'CNH' || item.cur_unit === 'CNY'
    );

    if (cnyEntry && cnyEntry.deal_bas_r) {
      // deal_bas_r: 매매기준율 (문자열, 쉼표 포함 가능)
      const rate = parseFloat(cnyEntry.deal_bas_r.replace(/,/g, ''));
      if (rate > 0) {
        return { rate, source: '한국수출입은행' };
      }
    }
  } catch {
    // 수출입은행 API 실패 시 다음 소스로
  }
  return null;
}

async function fetchFromOpenErApi(): Promise<{ rate: number; source: string } | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/CNY', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;

    const json = await res.json();
    if (json.rates?.KRW) {
      return {
        rate: Math.round(json.rates.KRW * 100) / 100,
        source: '국제환율기준',
      };
    }
  } catch {
    // fallback
  }
  return null;
}

export async function GET(_request: NextRequest) {
  try {
    // 캐시 확인
    if (rateCache && Date.now() < rateCache.expiry) {
      return NextResponse.json(rateCache.data);
    }

    // 1순위: 한국수출입은행
    let result = await fetchFromKoreaExim();

    // 2순위: open.er-api.com
    if (!result) {
      result = await fetchFromOpenErApi();
    }

    // 3순위: 폴백
    if (!result) {
      result = { rate: 195, source: '기본환율' };
    }

    const baseRate = result.rate; // 매매기준율 (중시장률)
    const paymentRate = Math.round(baseRate * (1 + OVERSEAS_PAYMENT_FEE_RATE) * 100) / 100; // 결제 적용 환율

    const responseData = {
      baseRate,                    // 매매기준율 (참고용)
      rate: paymentRate,           // 결제 시 적용 환율 (수수료 포함)
      feeRate: OVERSEAS_PAYMENT_FEE_RATE, // 해외결제 수수료율
      currency: 'KRW',
      base: 'CNY',
      source: result.source,
      updatedAt: new Date().toISOString(),
    };

    // 캐시 저장
    rateCache = { data: responseData, expiry: Date.now() + CACHE_TTL };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in /api/exchange-rate/current:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
