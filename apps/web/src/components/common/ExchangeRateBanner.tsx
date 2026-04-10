'use client';

import { useExchangeRate } from '@/hooks/useExchangeRate';
import { cn } from '@/lib/cn';
import Skeleton from './Skeleton';

export default function ExchangeRateBanner() {
  const { rate, change, changePercent, loading } = useExchangeRate();

  const isUp = change >= 0;

  if (loading) {
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
            1 CNY = {rate.toFixed(2)} KRW
          </span>
        </div>

        {/* Change badge */}
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
            {changePercent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
