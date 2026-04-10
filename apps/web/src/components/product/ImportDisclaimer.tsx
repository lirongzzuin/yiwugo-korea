'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

export default function ImportDisclaimer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mx-4 mt-3 rounded-xl border border-tertiary/20 overflow-hidden bg-gradient-to-r from-tertiary/5 to-tertiary/10">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 w-full px-4 py-3"
      >
        <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">public</span>
        <div className="flex-1 text-left">
          <span className="text-sm font-semibold text-tertiary">해외직구 상품입니다</span>
        </div>
        <span
          className={cn(
            'material-symbols-outlined text-tertiary/60 text-[20px] transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-2.5 animate-fade-in">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary/70 mt-0.5 shrink-0">location_on</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              중국 이우시에서 직접 배송됩니다
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary/70 mt-0.5 shrink-0">schedule</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              배송 소요: <span className="font-semibold text-on-surface">항공 3-5일</span> / <span className="font-semibold text-on-surface">해운 10-14일</span>
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary/70 mt-0.5 shrink-0">gavel</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              관부가세가 별도 부과될 수 있습니다 (미화 $150 초과 시)
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary/70 mt-0.5 shrink-0">swap_horiz</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              반품/교환 시 국제 배송비가 발생합니다
            </p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[16px] text-tertiary/70 mt-0.5 shrink-0">verified</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              이우고 코리아 검수 서비스를 통해 품질을 확인합니다
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
