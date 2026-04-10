'use client';

import { cn } from '@/lib/cn';

interface ProductPriceProps {
  priceKRW: number;
  originalPriceKRW?: number;
  priceCNY?: number;
  discountPercent?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ProductPrice({
  priceKRW,
  originalPriceKRW,
  priceCNY,
  discountPercent,
  size = 'md',
  className,
}: ProductPriceProps) {
  const sizeClasses = {
    sm: { main: 'text-sm', original: 'text-xs', cny: 'text-[10px]', badge: 'text-[10px] px-1 py-0.5' },
    md: { main: 'text-base', original: 'text-xs', cny: 'text-xs', badge: 'text-xs px-1.5 py-0.5' },
    lg: { main: 'text-xl', original: 'text-sm', cny: 'text-sm', badge: 'text-sm px-2 py-1' },
  };

  const s = sizeClasses[size];

  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {discountPercent && discountPercent > 0 && (
          <span className={cn('font-bold text-primary bg-primary/10 rounded', s.badge)}>
            {discountPercent}%
          </span>
        )}
        <span className={cn('font-extrabold text-primary font-heading', s.main)}>
          {priceKRW.toLocaleString()}원
        </span>
        {originalPriceKRW && originalPriceKRW > priceKRW && (
          <span className={cn('line-through text-stone-400', s.original)}>
            {originalPriceKRW.toLocaleString()}원
          </span>
        )}
      </div>
      {priceCNY !== undefined && (
        <span className={cn('text-stone-400', s.cny)}>
          ¥{priceCNY.toFixed(2)} CNY
        </span>
      )}
    </div>
  );
}
