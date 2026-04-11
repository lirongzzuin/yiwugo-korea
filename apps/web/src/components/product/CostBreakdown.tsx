'use client';

import { useState, useMemo } from 'react';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { cn } from '@/lib/cn';

interface CostBreakdownProps {
  priceCny: number;
  quantity: number;
  weightKg: number;
  shippingMethod?: 'AIR' | 'SEA';
}

// Shipping cost constants (based on 2025-2026 China→Korea logistics market rates)
// Source: 배대지 업체 평균 시세 (123go, 직싸, 포스트팀 등)
const AIR_RATE_PER_KG = 3500;   // 항공특송: 약 3,000~4,000원/kg
const SEA_RATE_PER_KG = 1000;   // 해운: 약 800~1,500원/kg
const BASE_SHIPPING_FEE = 3000; // 기본 취급수수료
const COMMISSION_RATE = 0.05;   // 플랫폼 수수료 5%
const DUTY_FREE_LIMIT_USD = 150; // 목록통관 면세 한도 US$150
const CUSTOMS_DUTY_RATE = 0.08; // 관세율 8% (일반 공산품 기준)
const VAT_RATE = 0.10;          // 부가세 10%
const USD_TO_KRW = 1380;        // USD 환율 (근사값)

const TOOLTIP_TEXTS: Record<string, string> = {
  product: '중국 위안화(CNY) 가격에 실시간 환율을 적용한 원화 환산 금액입니다.',
  shipping: '상품 총 중량 기준으로 계산됩니다. 항공은 빠르지만 비용이 높고, 해운은 저렴하지만 시간이 더 걸립니다.',
  duty: '과세가격(상품가 + 배송비) 기준 8% 관세가 부과됩니다. 미화 $150 이하는 관세가 면제됩니다.',
  vat: '과세가격(상품가 + 배송비 + 관세)의 10%가 부가세로 부과됩니다. 면세 기준 이하 시 면제됩니다.',
  commission: '이우고 코리아 플랫폼 수수료(상품가의 5%)입니다. 검수, 통관 대행, 고객 지원이 포함됩니다.',
};

export default function CostBreakdown({
  priceCny,
  quantity,
  weightKg,
  shippingMethod: defaultMethod = 'AIR',
}: CostBreakdownProps) {
  const { data: exchangeRate, isLoading } = useExchangeRate();
  const [method, setMethod] = useState<'AIR' | 'SEA'>(defaultMethod);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const costs = useMemo(() => {
    const rate = exchangeRate?.rate || 190;
    const totalCny = priceCny * quantity;
    const productKrw = Math.round(totalCny * rate);
    const totalWeightKg = weightKg * quantity;

    // Shipping
    const ratePerKg = method === 'AIR' ? AIR_RATE_PER_KG : SEA_RATE_PER_KG;
    const shippingKrw = Math.round(totalWeightKg * ratePerKg + BASE_SHIPPING_FEE);

    // Commission
    const commissionKrw = Math.round(productKrw * COMMISSION_RATE);

    // Customs duty calculation
    const totalValueUsd = Math.round(productKrw / USD_TO_KRW);
    const isDutyFree = totalValueUsd <= DUTY_FREE_LIMIT_USD;
    const customsDutyKrw = isDutyFree ? 0 : Math.round((productKrw + shippingKrw) * CUSTOMS_DUTY_RATE);
    const vatKrw = isDutyFree ? 0 : Math.round((productKrw + shippingKrw + customsDutyKrw) * VAT_RATE);

    const totalKrw = productKrw + shippingKrw + commissionKrw + customsDutyKrw + vatKrw;
    const dutyFreeProgress = Math.min((totalValueUsd / DUTY_FREE_LIMIT_USD) * 100, 100);

    return {
      totalCny,
      productKrw,
      shippingKrw,
      commissionKrw,
      customsDutyKrw,
      vatKrw,
      totalKrw,
      totalValueUsd,
      isDutyFree,
      dutyFreeProgress,
      rate,
      deliveryDays: method === 'AIR' ? '3-5' : '10-14',
    };
  }, [priceCny, quantity, weightKg, method, exchangeRate]);

  const handleTooltipToggle = (key: string) => {
    setShowTooltip((prev) => (prev === key ? null : key));
  };

  if (isLoading) {
    return (
      <div className="mx-4 mt-3 p-5 bg-surface-container-lowest rounded-xl border border-outline-variant/20 animate-pulse">
        <div className="h-5 bg-surface-container rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-surface-container rounded w-24" />
              <div className="h-4 bg-surface-container rounded w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mt-3 bg-surface-container-lowest rounded-xl border border-outline-variant/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full px-5 py-4"
      >
        <h3 className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-secondary">calculate</span>
          예상 비용 상세
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-primary">
            {costs.totalKrw.toLocaleString()}원
          </span>
          <span
            className={cn(
              'material-symbols-outlined text-on-surface-variant transition-transform duration-200 text-[20px]',
              isExpanded && 'rotate-180'
            )}
          >
            expand_more
          </span>
        </div>
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4">
          {/* Shipping method toggle */}
          <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
            <button
              onClick={() => setMethod('AIR')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5',
                method === 'AIR'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">flight</span>
              <span>항공 배송</span>
              <span className="text-[10px] text-on-surface-variant">3-5일 소요</span>
            </button>
            <button
              onClick={() => setMethod('SEA')}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex flex-col items-center gap-0.5',
                method === 'SEA'
                  ? 'bg-white text-primary shadow-soft'
                  : 'text-on-surface-variant hover:text-on-surface'
              )}
            >
              <span className="material-symbols-outlined text-[18px]">sailing</span>
              <span>해운 배송</span>
              <span className="text-[10px] text-on-surface-variant">10-14일 소요</span>
            </button>
          </div>

          {/* Cost line items */}
          <div className="space-y-0">
            {/* Product price */}
            <CostLineItem
              icon="inventory_2"
              label="상품 가격"
              sublabel={`¥${costs.totalCny.toFixed(2)} CNY`}
              amount={costs.productKrw}
              tooltipKey="product"
              showTooltip={showTooltip}
              onTooltipToggle={handleTooltipToggle}
            />

            {/* Shipping */}
            <CostLineItem
              icon={method === 'AIR' ? 'flight' : 'sailing'}
              label="국제 배송비"
              sublabel={`${(weightKg * quantity).toFixed(1)}kg × ₩${method === 'AIR' ? AIR_RATE_PER_KG.toLocaleString() : SEA_RATE_PER_KG.toLocaleString()}/kg + 기본료`}
              amount={costs.shippingKrw}
              tooltipKey="shipping"
              showTooltip={showTooltip}
              onTooltipToggle={handleTooltipToggle}
            />

            {/* Commission */}
            <CostLineItem
              icon="storefront"
              label="수수료"
              sublabel="플랫폼 수수료 5%"
              amount={costs.commissionKrw}
              tooltipKey="commission"
              showTooltip={showTooltip}
              onTooltipToggle={handleTooltipToggle}
            />

            {/* Customs duty */}
            <CostLineItem
              icon="gavel"
              label="예상 관세"
              sublabel={costs.isDutyFree ? '면세 적용' : '과세가격 × 8%'}
              amount={costs.customsDutyKrw}
              isFree={costs.isDutyFree}
              tooltipKey="duty"
              showTooltip={showTooltip}
              onTooltipToggle={handleTooltipToggle}
            />

            {/* VAT */}
            <CostLineItem
              icon="receipt"
              label="예상 부가세"
              sublabel={costs.isDutyFree ? '면세 적용' : '과세가격 × 10%'}
              amount={costs.vatKrw}
              isFree={costs.isDutyFree}
              tooltipKey="vat"
              showTooltip={showTooltip}
              onTooltipToggle={handleTooltipToggle}
            />
          </div>

          {/* Duty-free progress bar */}
          <div className="p-3 bg-surface-container-low rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-on-surface">
                면세 한도 (US${DUTY_FREE_LIMIT_USD})
              </span>
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                costs.isDutyFree
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              )}>
                {costs.isDutyFree ? '면세 대상' : '과세 대상'}
              </span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  costs.isDutyFree ? 'bg-green-500' : 'bg-red-500'
                )}
                style={{ width: `${costs.dutyFreeProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-on-surface-variant">
                현재 US${costs.totalValueUsd}
              </span>
              <span className="text-[10px] text-on-surface-variant">
                US${DUTY_FREE_LIMIT_USD}
              </span>
            </div>
          </div>

          {/* Total */}
          <div className="border-t border-outline-variant/30 pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-base text-on-surface">총 예상 비용</span>
              <span className="font-heading font-extrabold text-xl text-primary">
                {costs.totalKrw.toLocaleString()}원
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">
              예상 배송: {costs.deliveryDays}일 ({method === 'AIR' ? '항공' : '해운'})
            </p>
          </div>

          {/* Exchange rate info */}
          {exchangeRate && (
            <div className="flex items-center gap-1.5 text-[10px] text-on-surface-variant/70">
              <span className="material-symbols-outlined text-[12px]">currency_exchange</span>
              <span>
                1 CNY = ₩{exchangeRate.rate.toFixed(2)} |{' '}
                {exchangeRate.source !== 'fallback' ? exchangeRate.source : '기본 환율'} |{' '}
                {new Date(exchangeRate.lastUpdated).toLocaleString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
            <span className="material-symbols-outlined text-secondary text-[16px] mt-0.5 shrink-0">info</span>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              이 금액은 예상치이며, 실제 통관 시 변경될 수 있습니다.
              환율 변동, 상품 실중량, 세관 판단에 따라 최종 금액이 달라질 수 있습니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for each cost line
function CostLineItem({
  icon,
  label,
  sublabel,
  amount,
  isFree,
  tooltipKey,
  showTooltip,
  onTooltipToggle,
}: {
  icon: string;
  label: string;
  sublabel: string;
  amount: number;
  isFree?: boolean;
  tooltipKey: string;
  showTooltip: string | null;
  onTooltipToggle: (key: string) => void;
}) {
  return (
    <div className="relative">
      <div className="flex items-center gap-3 py-2.5 border-b border-outline-variant/10 last:border-0">
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant/60 shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm text-on-surface">{label}</span>
            <button
              onClick={() => onTooltipToggle(tooltipKey)}
              className="w-4 h-4 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
            >
              <span className="text-[10px] text-on-surface-variant font-bold">?</span>
            </button>
          </div>
          <span className="text-[10px] text-on-surface-variant">{sublabel}</span>
        </div>
        <span className={cn(
          'text-sm font-semibold shrink-0',
          isFree ? 'text-green-600' : 'text-on-surface'
        )}>
          {isFree ? '₩0' : `${amount.toLocaleString()}원`}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip === tooltipKey && (
        <div className="absolute left-0 right-0 top-full z-10 mx-2 p-3 bg-on-surface text-white text-xs rounded-lg shadow-strong animate-fade-in leading-relaxed">
          {TOOLTIP_TEXTS[tooltipKey]}
          <div className="absolute -top-1 left-6 w-2 h-2 bg-on-surface rotate-45" />
        </div>
      )}
    </div>
  );
}
