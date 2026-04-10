'use client';

import KPICard from '@/components/admin/KPICard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { cn } from '@/lib/cn';

const recentOrders = [
  { id: 'ORD-240410-001', customer: '김민수', amount: '¥2,450 (₩458,000)', status: '결제완료', statusColor: 'bg-blue-100 text-blue-700', date: '2026-04-10 14:23' },
  { id: 'ORD-240410-002', customer: '이지영', amount: '¥8,900 (₩1,665,000)', status: '배송중', statusColor: 'bg-amber-100 text-amber-700', date: '2026-04-10 13:15' },
  { id: 'ORD-240410-003', customer: '박서준', amount: '¥1,200 (₩224,000)', status: '검수중', statusColor: 'bg-purple-100 text-purple-700', date: '2026-04-10 11:42' },
  { id: 'ORD-240409-021', customer: '최예린', amount: '¥15,300 (₩2,862,000)', status: '배송완료', statusColor: 'bg-green-100 text-green-700', date: '2026-04-09 18:30' },
  { id: 'ORD-240409-020', customer: '정하늘', amount: '¥3,800 (₩711,000)', status: '결제완료', statusColor: 'bg-blue-100 text-blue-700', date: '2026-04-09 16:55' },
];

const popularProducts = [
  { rank: 1, name: '실리콘 주방용품 5종 세트', sales: 342, image: '🍳' },
  { rank: 2, name: 'LED 미니 프로젝터', sales: 287, image: '📽️' },
  { rank: 3, name: '스테인리스 텀블러 500ml', sales: 256, image: '🥤' },
  { rank: 4, name: '무선 블루투스 이어폰', sales: 231, image: '🎧' },
  { rank: 5, name: '접이식 캠핑 의자', sales: 198, image: '🪑' },
];

const salesData = [65, 78, 52, 91, 85, 73, 98, 110, 87, 95, 102, 88];
const maxSale = Math.max(...salesData);

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="관리자 대시보드"
        description="이우고 코리아 운영 현황을 한눈에 확인하세요."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon="payments"
          label="오늘 매출"
          value="₩12,540,000"
          change={{ value: 12.5, direction: 'up' }}
          variant="primary"
        />
        <KPICard
          icon="shopping_cart"
          label="신규 주문"
          value="47건"
          change={{ value: 8.3, direction: 'up' }}
          variant="success"
        />
        <KPICard
          icon="person_add"
          label="신규 가입"
          value="23명"
          change={{ value: 3.1, direction: 'down' }}
          variant="warning"
        />
        <KPICard
          icon="currency_exchange"
          label="현재 환율"
          value="¥1 = ₩187.2"
          change={{ value: 0.4, direction: 'up' }}
          variant="default"
        />
      </div>

      {/* Charts + Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-heading text-on-surface">매출 추이</h2>
            <div className="flex gap-1">
              {['일간', '주간', '월간'].map((label, i) => (
                <button
                  key={label}
                  className={cn(
                    'px-3 py-1 text-xs rounded-lg font-medium transition-colors',
                    i === 0
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Mock bar chart */}
          <div className="flex items-end gap-2 h-48 pt-4">
            {salesData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary/80 rounded-t-md hover:bg-primary transition-colors min-h-[4px]"
                  style={{ height: `${(val / maxSale) * 100}%` }}
                />
                <span className="text-[10px] text-on-surface-variant">
                  {i + 1}월
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30 space-y-4">
          <h2 className="text-lg font-bold font-heading text-on-surface">빠른 현황</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600">help</span>
                <span className="text-sm font-medium text-on-surface">미처리 문의</span>
              </div>
              <span className="text-lg font-bold text-amber-700">12</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600">undo</span>
                <span className="text-sm font-medium text-on-surface">미처리 환불</span>
              </div>
              <span className="text-lg font-bold text-red-700">3</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">cloud_done</span>
                <span className="text-sm font-medium text-on-surface">이우고 API</span>
              </div>
              <span className="text-sm font-semibold text-green-700">정상 운영중</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface-container rounded-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant">inventory</span>
                <span className="text-sm font-medium text-on-surface">재고 부족</span>
              </div>
              <span className="text-lg font-bold text-on-surface-variant">8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Popular Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-soft border border-outline-variant/30 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/20">
            <h2 className="text-lg font-bold font-heading text-on-surface">최근 주문</h2>
            <a href="/admin/orders" className="text-sm text-primary font-medium hover:underline">
              전체보기
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">주문번호</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">고객명</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">금액</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">상태</th>
                  <th className="text-left px-5 py-3 font-semibold text-on-surface-variant">날짜</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                  >
                    <td className="px-5 py-3 font-mono text-xs text-primary font-medium">{order.id}</td>
                    <td className="px-5 py-3 text-on-surface">{order.customer}</td>
                    <td className="px-5 py-3 text-on-surface whitespace-nowrap">{order.amount}</td>
                    <td className="px-5 py-3">
                      <span className={cn('px-2 py-1 text-xs font-medium rounded-full', order.statusColor)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-on-surface-variant text-xs">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular Products */}
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <h2 className="text-lg font-bold font-heading text-on-surface mb-4">인기 상품</h2>
          <ul className="space-y-3">
            {popularProducts.map((product) => (
              <li key={product.rank} className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
                    product.rank <= 3
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant'
                  )}
                >
                  {product.rank}
                </span>
                <div className="w-9 h-9 bg-surface-container rounded-lg flex items-center justify-center text-lg">
                  {product.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{product.name}</p>
                  <p className="text-xs text-on-surface-variant">{product.sales}건 판매</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
