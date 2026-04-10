'use client';

import { useExchangeRate } from '@/hooks/useExchangeRate';
import { cn } from '@/lib/cn';
import Skeleton from './Skeleton';

export default function ExchangeRateBanner() {
  const { data, isLoading, error } = useExchangeRate();

  if (isLoading) {
    return (
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-4">
          <Skeleton variant="text" width={140} className="h-3" />
          <Skeleton variant="text" width={180} className="h-4" />
          <Skeleton variant="rounded" width={60} className="h-5" />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="w-full bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <span className="material-symbols-outlined text-error text-[16px]">error</span>
          <span className="text-xs text-on-surface-variant">{error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isUp = data.change >= 0;

  return (
    <div className="w-full bg-surface-container-low border-b border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3 text-sm overflow-x-auto scrollbar-hide">
        {/* Label */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="material-symbols-outlined text-secondary text-[16px]">
            currency_exchange
          </span>
          <span className="text-xs font-medium text-on-surface-variant">
            실시간 환율
          </span>
        </div>

        {/* Rate */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-sm font-heading font-bold text-on-surface">
            1 CNY = {data.rate.toFixed(2)} KRW
          </span>
        </div>

        {/* Change badge */}
        {data.change !== 0 && (
          <div
            className={cn(
              'flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold shrink-0',
              isUp
                ? 'bg-red-50 text-red-600'
                : 'bg-blue-50 text-blue-600'
            )}
          >
            <span className="material-symbols-outlined text-[14px]">
              {isUp ? 'arrow_drop_up' : 'arrow_drop_down'}
            </span>
            <span>
              {isUp ? '+' : ''}
              {data.changePercent.toFixed(2)}%
            </span>
          </div>
        )}

        {/* Source indicator */}
        <div className="flex items-center gap-1 shrink-0">
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            data.source === 'fallback' || data.source === 'cache' ? 'bg-orange-400' : 'bg-green-500'
          )} />
          <span className="text-[10px] text-on-surface-variant/60">
            {data.source === 'fallback' ? '기본값' : data.source === 'cache' ? '캐시' : 'LIVE'}
          </span>
        </div>
      </div>
    </div>
  );
}
