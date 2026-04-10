'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import KPICard from '@/components/admin/KPICard';
import { cn } from '@/lib/cn';

const periods = ['오늘', '이번주', '이번달', '3개월'] as const;

const topProducts = [
  { rank: 1, name: '실리콘 주방용품 5종 세트', category: '주방용품', sales: 342, revenue: '₩15,600,000' },
  { rank: 2, name: 'LED 미니 프로젝터', category: '전자기기', sales: 287, revenue: '₩43,050,000' },
  { rank: 3, name: '스테인리스 텀블러 500ml', category: '생활용품', sales: 256, revenue: '₩7,680,000' },
  { rank: 4, name: '무선 블루투스 이어폰', category: '전자기기', sales: 231, revenue: '₩18,480,000' },
  { rank: 5, name: '접이식 캠핑 의자', category: '아웃도어', sales: 198, revenue: '₩13,860,000' },
  { rank: 6, name: '실리콘 폰케이스 (다색)', category: '모바일', sales: 185, revenue: '₩1,850,000' },
  { rank: 7, name: 'USB-C 멀티 허브 7in1', category: '전자기기', sales: 172, revenue: '₩10,320,000' },
  { rank: 8, name: '미니 가습기 USB', category: '생활가전', sales: 168, revenue: '₩5,040,000' },
  { rank: 9, name: '아크릴 진열대 3단', category: '사무용품', sales: 155, revenue: '₩4,650,000' },
  { rank: 10, name: '자석 케이블 정리함', category: '정리수납', sales: 143, revenue: '₩2,860,000' },
];

const topSearches = [
  { rank: 1, keyword: '블루투스 이어폰', count: 1245 },
  { rank: 2, keyword: '실리콘 주방용품', count: 987 },
  { rank: 3, keyword: 'LED 조명', count: 856 },
  { rank: 4, keyword: '캠핑 용품', count: 743 },
  { rank: 5, keyword: '텀블러', count: 698 },
  { rank: 6, keyword: 'USB 허브', count: 612 },
  { rank: 7, keyword: '폰케이스', count: 589 },
  { rank: 8, keyword: '가습기', count: 534 },
  { rank: 9, keyword: '수납 정리', count: 478 },
  { rank: 10, keyword: '미니 프로젝터', count: 423 },
];

const monthlySales = [
  { month: '1월', value: 45 },
  { month: '2월', value: 52 },
  { month: '3월', value: 61 },
  { month: '4월', value: 58 },
  { month: '5월', value: 72 },
  { month: '6월', value: 68 },
  { month: '7월', value: 85 },
  { month: '8월', value: 92 },
  { month: '9월', value: 78 },
  { month: '10월', value: 95 },
  { month: '11월', value: 110 },
  { month: '12월', value: 125 },
];
const maxSale = Math.max(...monthlySales.map((s) => s.value));

const categoryData = [
  { name: '전자기기', percentage: 32, color: 'bg-primary' },
  { name: '주방용품', percentage: 18, color: 'bg-amber-500' },
  { name: '생활용품', percentage: 15, color: 'bg-green-500' },
  { name: '아웃도어', percentage: 12, color: 'bg-blue-500' },
  { name: '모바일', percentage: 10, color: 'bg-purple-500' },
  { name: '기타', percentage: 13, color: 'bg-gray-400' },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<(typeof periods)[number]>('이번달');

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="통계/분석"
        description="플랫폼 운영 데이터를 분석합니다."
        actions={
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-outline-variant/40 text-sm font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">download</span>
              Excel
            </button>
            <button className="px-4 py-2 border border-outline-variant/40 text-sm font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">csv</span>
              CSV
            </button>
          </div>
        }
      />

      {/* Period Selector */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              period === p
                ? 'bg-white text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon="payments" label="총 매출" value="₩345,200,000" change={{ value: 15.2, direction: 'up' }} variant="primary" />
        <KPICard icon="shopping_cart" label="총 주문" value="1,847건" change={{ value: 8.7, direction: 'up' }} variant="success" />
        <KPICard icon="people" label="활성 사용자" value="3,256명" change={{ value: 12.1, direction: 'up' }} variant="default" />
        <KPICard icon="avg_pace" label="평균 주문가" value="₩186,800" change={{ value: 2.3, direction: 'down' }} variant="warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <h2 className="text-lg font-bold font-heading text-on-surface mb-4">매출 추이</h2>
          <div className="flex items-end gap-2 h-52">
            {monthlySales.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-medium text-on-surface-variant">
                  {Math.round(item.value * 0.345)}M
                </span>
                <div
                  className="w-full bg-primary/80 rounded-t-md hover:bg-primary transition-colors min-h-[4px]"
                  style={{ height: `${(item.value / maxSale) * 100}%` }}
                />
                <span className="text-[10px] text-on-surface-variant">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Donut (CSS placeholder) */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <h2 className="text-lg font-bold font-heading text-on-surface mb-4">카테고리별 매출 비중</h2>
          <div className="flex items-center justify-center my-4">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  const colors = ['#b32008', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#9ca3af'];
                  return categoryData.map((cat, i) => {
                    const stroke = (cat.percentage / 100) * 100;
                    const dashArray = `${stroke} ${100 - stroke}`;
                    const el = (
                      <circle
                        key={cat.name}
                        cx="18" cy="18" r="15.9"
                        fill="transparent"
                        stroke={colors[i]}
                        strokeWidth="3.5"
                        strokeDasharray={dashArray}
                        strokeDashoffset={-offset}
                      />
                    );
                    offset += stroke;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-bold text-on-surface">100%</p>
                  <p className="text-[10px] text-on-surface-variant">전체</p>
                </div>
              </div>
            </div>
          </div>
          <ul className="space-y-2 mt-4">
            {categoryData.map((cat) => (
              <li key={cat.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className={cn('w-2.5 h-2.5 rounded-full', cat.color)} />
                  <span className="text-on-surface">{cat.name}</span>
                </div>
                <span className="font-medium text-on-surface-variant">{cat.percentage}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top 10 Products + Searches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-outline-variant/30 overflow-hidden">
          <div className="px-5 py-4 border-b border-outline-variant/20">
            <h2 className="text-lg font-bold font-heading text-on-surface">Top 10 상품</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant w-12">순위</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">상품명</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">카테고리</th>
                  <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">판매량</th>
                  <th className="text-right px-5 py-3 font-semibold text-on-surface-variant">매출</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.rank} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50">
                    <td className="px-5 py-3">
                      <span className={cn('w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold', p.rank <= 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant')}>
                        {p.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-on-surface">{p.name}</td>
                    <td className="px-5 py-3 text-on-surface-variant">{p.category}</td>
                    <td className="px-5 py-3 text-right text-on-surface">{p.sales.toLocaleString()}건</td>
                    <td className="px-5 py-3 text-right font-medium text-on-surface">{p.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Searches */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <h2 className="text-lg font-bold font-heading text-on-surface mb-4">Top 10 검색어</h2>
          <ul className="space-y-3">
            {topSearches.map((s) => (
              <li key={s.rank} className="flex items-center gap-3">
                <span className={cn('w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0', s.rank <= 3 ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant')}>
                  {s.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-on-surface truncate">{s.keyword}</span>
                    <span className="text-xs text-on-surface-variant flex-shrink-0 ml-2">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full"
                      style={{ width: `${(s.count / topSearches[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
