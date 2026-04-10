'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

type GuideType = 'shoes' | 'clothing';

interface SizeGuideProps {
  type?: GuideType;
  isOpen: boolean;
  onClose: () => void;
}

const SHOE_SIZE_TABLE = [
  { cn: '35', eu: '35', kr: '225', us_m: '4', us_w: '5' },
  { cn: '36', eu: '36', kr: '230', us_m: '4.5', us_w: '5.5' },
  { cn: '37', eu: '37', kr: '235', us_m: '5', us_w: '6' },
  { cn: '38', eu: '38', kr: '240', us_m: '5.5', us_w: '7' },
  { cn: '39', eu: '39', kr: '245', us_m: '6.5', us_w: '7.5' },
  { cn: '40', eu: '40', kr: '250', us_m: '7', us_w: '8' },
  { cn: '41', eu: '41', kr: '255', us_m: '7.5', us_w: '8.5' },
  { cn: '42', eu: '42', kr: '260', us_m: '8.5', us_w: '9.5' },
  { cn: '43', eu: '43', kr: '270', us_m: '9.5', us_w: '10.5' },
  { cn: '44', eu: '44', kr: '280', us_m: '10', us_w: '11' },
  { cn: '45', eu: '45', kr: '285', us_m: '11', us_w: '12' },
  { cn: '46', eu: '46', kr: '290', us_m: '12', us_w: '13' },
];

const CLOTHING_SIZE_TABLE = [
  { cn: 'S', kr: 'S (85)', chest: '86-90', waist: '70-74', hip: '88-92' },
  { cn: 'M', kr: 'M (90)', chest: '90-94', waist: '74-78', hip: '92-96' },
  { cn: 'L', kr: 'L (95)', chest: '94-98', waist: '78-82', hip: '96-100' },
  { cn: 'XL', kr: 'XL (100)', chest: '98-102', waist: '82-86', hip: '100-104' },
  { cn: '2XL', kr: '2XL (105)', chest: '102-106', waist: '86-90', hip: '104-108' },
  { cn: '3XL', kr: '3XL (110)', chest: '106-110', waist: '90-94', hip: '108-112' },
];

export default function SizeGuide({ type = 'shoes', isOpen, onClose }: SizeGuideProps) {
  const [activeType, setActiveType] = useState<GuideType>(type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full md:max-w-lg bg-surface-container-lowest rounded-t-2xl md:rounded-2xl max-h-[80vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20">
          <h3 className="text-base font-heading font-bold text-on-surface">사이즈 가이드</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 px-4 py-3">
          <button
            onClick={() => setActiveType('shoes')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeType === 'shoes'
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant'
            )}
          >
            신발 사이즈
          </button>
          <button
            onClick={() => setActiveType('clothing')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              activeType === 'clothing'
                ? 'bg-primary text-white'
                : 'bg-surface-container text-on-surface-variant'
            )}
          >
            의류 사이즈
          </button>
        </div>

        {/* Table */}
        <div className="px-4 pb-6 overflow-x-auto">
          {activeType === 'shoes' ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">CN/EU</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-primary">KR (mm)</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">US 남성</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">US 여성</th>
                </tr>
              </thead>
              <tbody>
                {SHOE_SIZE_TABLE.map((row) => (
                  <tr key={row.cn} className="border-b border-outline-variant/10">
                    <td className="py-2 px-2 text-on-surface-variant">{row.cn}</td>
                    <td className="py-2 px-2 font-semibold text-on-surface">{row.kr}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{row.us_m}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{row.us_w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">CN</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-primary">KR</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">가슴(cm)</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">허리(cm)</th>
                  <th className="py-2 px-2 text-left text-[11px] font-semibold text-on-surface-variant">엉덩이(cm)</th>
                </tr>
              </thead>
              <tbody>
                {CLOTHING_SIZE_TABLE.map((row) => (
                  <tr key={row.cn} className="border-b border-outline-variant/10">
                    <td className="py-2 px-2 text-on-surface-variant">{row.cn}</td>
                    <td className="py-2 px-2 font-semibold text-on-surface">{row.kr}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{row.chest}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{row.waist}</td>
                    <td className="py-2 px-2 text-on-surface-variant">{row.hip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Unit conversion info */}
          <div className="mt-4 p-3 bg-surface-container-low rounded-lg">
            <h4 className="text-[11px] font-semibold text-on-surface mb-2">단위 변환 참고</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant">
              <span>1 公斤(kg) = 1kg</span>
              <span>1 克(g) = 1g</span>
              <span>1 厘米(cm) = 1cm</span>
              <span>1 米(m) = 1m</span>
              <span>1 寸(인치) = 2.54cm</span>
              <span>1 尺 = 33.3cm</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
