'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/cn';

interface Settlement {
  id: string;
  period: string;
  totalSales: string;
  commission: string;
  refunds: string;
  pgFee: string;
  netRevenue: string;
  status: string;
  orderCount: number;
  [key: string]: unknown;
}

const mockSettlements: Settlement[] = [
  { id: 'S2026-04-W1', period: '2026.04.01 - 04.07', totalSales: '₩85,400,000', commission: '₩6,832,000', refunds: '₩2,100,000', pgFee: '₩2,562,000', netRevenue: '₩73,906,000', status: '정산대기', orderCount: 234 },
  { id: 'S2026-03-W4', period: '2026.03.25 - 03.31', totalSales: '₩92,100,000', commission: '₩7,368,000', refunds: '₩1,800,000', pgFee: '₩2,763,000', netRevenue: '₩80,169,000', status: '정산완료', orderCount: 267 },
  { id: 'S2026-03-W3', period: '2026.03.18 - 03.24', totalSales: '₩78,300,000', commission: '₩6,264,000', refunds: '₩3,200,000', pgFee: '₩2,349,000', netRevenue: '₩66,487,000', status: '정산완료', orderCount: 198 },
  { id: 'S2026-03-W2', period: '2026.03.11 - 03.17', totalSales: '₩88,700,000', commission: '₩7,096,000', refunds: '₩1,500,000', pgFee: '₩2,661,000', netRevenue: '₩77,443,000', status: '정산완료', orderCount: 245 },
  { id: 'S2026-03-W1', period: '2026.03.04 - 03.10', totalSales: '₩71,200,000', commission: '₩5,696,000', refunds: '₩2,800,000', pgFee: '₩2,136,000', netRevenue: '₩60,568,000', status: '정산완료', orderCount: 189 },
  { id: 'S2026-02-W4', period: '2026.02.25 - 03.03', totalSales: '₩65,800,000', commission: '₩5,264,000', refunds: '₩1,200,000', pgFee: '₩1,974,000', netRevenue: '₩57,362,000', status: '정산완료', orderCount: 176 },
];

const statusColors: Record<string, string> = {
  '정산대기': 'bg-amber-100 text-amber-700',
  '정산중': 'bg-blue-100 text-blue-700',
  '정산완료': 'bg-green-100 text-green-700',
};

export default function AdminSettlementsPage() {
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);

  const columns: Column<Settlement>[] = [
    {
      key: 'period',
      label: '기간',
      render: (row) => <span className="font-medium text-on-surface whitespace-nowrap">{row.period}</span>,
    },
    {
      key: 'totalSales',
      label: '총 거래액',
      sortable: true,
      render: (row) => <span className="font-medium">{row.totalSales}</span>,
    },
    {
      key: 'commission',
      label: '수수료',
      render: (row) => <span className="text-on-surface-variant">{row.commission}</span>,
    },
    {
      key: 'refunds',
      label: '환불',
      render: (row) => <span className="text-red-600">{row.refunds}</span>,
    },
    {
      key: 'pgFee',
      label: 'PG수수료',
      render: (row) => <span className="text-on-surface-variant">{row.pgFee}</span>,
    },
    {
      key: 'netRevenue',
      label: '순수익',
      sortable: true,
      render: (row) => <span className="font-bold text-green-700">{row.netRevenue}</span>,
    },
    {
      key: 'status',
      label: '상태',
      render: (row) => (
        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', statusColors[row.status])}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setSelectedSettlement(row); }}
            className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
            title="상세보기"
          >
            <span className="material-symbols-outlined text-lg text-on-surface-variant">visibility</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="정산 관리"
        description="주간 정산 내역을 조회하고 확인합니다."
        actions={
          <button className="px-4 py-2 border border-outline-variant/40 text-sm font-medium rounded-xl hover:bg-surface-container transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">download</span>
            정산 내역 다운로드
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <p className="text-sm text-on-surface-variant">이번 달 총 거래액</p>
          <p className="text-2xl font-bold font-heading text-on-surface mt-1">₩345,700,000</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <p className="text-sm text-on-surface-variant">이번 달 순수익</p>
          <p className="text-2xl font-bold font-heading text-green-700 mt-1">₩298,005,000</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/30">
          <p className="text-sm text-on-surface-variant">정산 대기</p>
          <p className="text-2xl font-bold font-heading text-amber-600 mt-1">1건</p>
        </div>
      </div>

      <DataTable columns={columns} data={mockSettlements} pageSize={10} onRowClick={(row) => setSelectedSettlement(row)} />

      {/* Settlement Detail Modal */}
      {selectedSettlement && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedSettlement(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-strong animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold font-heading">정산 상세</h3>
              <button onClick={() => setSelectedSettlement(null)} className="p-1 rounded-lg hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">정산 ID</span>
                <span className="font-mono text-sm">{selectedSettlement.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-on-surface-variant">기간</span>
                <span className="text-sm font-medium">{selectedSettlement.period}</span>
              </div>
              <div className="border-t border-outline-variant/20 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">총 거래액</span>
                  <span className="text-sm font-bold">{selectedSettlement.totalSales}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface">주문 건수</span>
                  <span className="text-sm font-medium">{selectedSettlement.orderCount}건</span>
                </div>
                <div className="flex items-center justify-between text-red-600">
                  <span className="text-sm">(-) 환불</span>
                  <span className="text-sm font-medium">{selectedSettlement.refunds}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-sm">(-) 플랫폼 수수료 (8%)</span>
                  <span className="text-sm font-medium">{selectedSettlement.commission}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="text-sm">(-) PG 수수료 (3%)</span>
                  <span className="text-sm font-medium">{selectedSettlement.pgFee}</span>
                </div>
                <div className="border-t border-outline-variant/20 pt-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-on-surface">순수익</span>
                  <span className="text-lg font-bold text-green-700">{selectedSettlement.netRevenue}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-outline-variant/20">
              <button className="px-4 py-2 text-sm font-medium rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-colors flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg">download</span>
                내보내기
              </button>
              {selectedSettlement.status === '정산대기' && (
                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors">
                  정산 확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
