'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/cn';

interface Coupon {
  id: string;
  name: string;
  code: string;
  type: string;
  discountValue: string;
  usedCount: number;
  issuedCount: number;
  status: string;
  startDate: string;
  endDate: string;
  minOrderAmount?: string;
  maxDiscount?: string;
  [key: string]: unknown;
}

const mockCoupons: Coupon[] = [
  { id: 'C001', name: '신규 가입 환영 쿠폰', code: 'WELCOME2026', type: '정률', discountValue: '10%', usedCount: 345, issuedCount: 1000, status: '활성', startDate: '2026-01-01', endDate: '2026-12-31', minOrderAmount: '₩50,000', maxDiscount: '₩20,000' },
  { id: 'C002', name: '봄맞이 특별 할인', code: 'SPRING2026', type: '정액', discountValue: '₩5,000', usedCount: 187, issuedCount: 500, status: '활성', startDate: '2026-03-01', endDate: '2026-05-31', minOrderAmount: '₩30,000' },
  { id: 'C003', name: 'VIP 전용 쿠폰', code: 'VIP15OFF', type: '정률', discountValue: '15%', usedCount: 89, issuedCount: 200, status: '활성', startDate: '2026-04-01', endDate: '2026-06-30', minOrderAmount: '₩100,000', maxDiscount: '₩50,000' },
  { id: 'C004', name: '첫 구매 무료배송', code: 'FREESHIP', type: '배송비', discountValue: '무료배송', usedCount: 523, issuedCount: 0, status: '활성', startDate: '2026-01-01', endDate: '2026-12-31' },
  { id: 'C005', name: '설날 이벤트 쿠폰', code: 'NEWYEAR26', type: '정액', discountValue: '₩10,000', usedCount: 412, issuedCount: 500, status: '만료', startDate: '2026-01-25', endDate: '2026-02-10', minOrderAmount: '₩80,000' },
  { id: 'C006', name: '리뷰 작성 감사 쿠폰', code: 'REVIEW3K', type: '정액', discountValue: '₩3,000', usedCount: 256, issuedCount: 0, status: '비활성', startDate: '2026-01-01', endDate: '2026-12-31', minOrderAmount: '₩20,000' },
];

const statusColors: Record<string, string> = {
  '활성': 'bg-green-100 text-green-700',
  '비활성': 'bg-gray-100 text-gray-600',
  '만료': 'bg-red-100 text-red-600',
};

const typeColors: Record<string, string> = {
  '정률': 'bg-blue-100 text-blue-700',
  '정액': 'bg-purple-100 text-purple-700',
  '배송비': 'bg-amber-100 text-amber-700',
};

export default function AdminCouponsPage() {
  const [showModal, setShowModal] = useState(false);
  const [coupons, setCoupons] = useState(mockCoupons);
  const [newCoupon, setNewCoupon] = useState({
    name: '', code: '', type: '정률', discountValue: '', issuedCount: 0, startDate: '', endDate: '', minOrderAmount: '',
  });

  const toggleStatus = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === '활성' ? '비활성' : '활성' }
          : c
      )
    );
  };

  const columns: Column<Coupon>[] = [
    { key: 'name', label: '쿠폰명', sortable: true, render: (row) => <span className="font-medium text-on-surface">{row.name}</span> },
    { key: 'code', label: '코드', render: (row) => <code className="px-2 py-0.5 bg-surface-container rounded text-xs font-mono">{row.code}</code> },
    { key: 'type', label: '유형', render: (row) => <span className={cn('px-2 py-0.5 text-xs font-medium rounded-md', typeColors[row.type])}>{row.type}</span> },
    { key: 'discountValue', label: '할인값', render: (row) => <span className="font-medium">{row.discountValue}</span> },
    {
      key: 'usage',
      label: '사용/발급',
      render: (row) => (
        <div>
          <span className="text-on-surface font-medium">{row.usedCount}</span>
          <span className="text-on-surface-variant">/{row.issuedCount === 0 ? '무제한' : row.issuedCount}</span>
          {row.issuedCount > 0 && (
            <div className="w-16 h-1.5 bg-surface-container rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full"
                style={{ width: `${Math.min((row.usedCount / row.issuedCount) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      ),
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
      key: 'period',
      label: '유효기간',
      render: (row) => (
        <span className="text-xs text-on-surface-variant">
          {row.startDate} ~ {row.endDate}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status !== '만료' && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleStatus(row.id); }}
              className={cn('p-1.5 rounded-lg hover:bg-surface-container transition-colors')}
              title={row.status === '활성' ? '비활성화' : '활성화'}
            >
              <span className="material-symbols-outlined text-lg text-on-surface-variant">
                {row.status === '활성' ? 'toggle_on' : 'toggle_off'}
              </span>
            </button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="편집">
            <span className="material-symbols-outlined text-lg text-on-surface-variant">edit</span>
          </button>
        </div>
      ),
    },
  ];

  const handleCreateCoupon = () => {
    const id = `C${String(coupons.length + 1).padStart(3, '0')}`;
    setCoupons((prev) => [
      {
        id,
        name: newCoupon.name,
        code: newCoupon.code,
        type: newCoupon.type,
        discountValue: newCoupon.discountValue,
        usedCount: 0,
        issuedCount: newCoupon.issuedCount,
        status: '활성',
        startDate: newCoupon.startDate,
        endDate: newCoupon.endDate,
        minOrderAmount: newCoupon.minOrderAmount,
      },
      ...prev,
    ]);
    setShowModal(false);
    setNewCoupon({ name: '', code: '', type: '정률', discountValue: '', issuedCount: 0, startDate: '', endDate: '', minOrderAmount: '' });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="쿠폰 관리"
        description="할인 쿠폰을 생성하고 관리합니다."
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            쿠폰 생성
          </button>
        }
      />

      <DataTable columns={columns} data={coupons} pageSize={10} />

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-strong animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold font-heading">쿠폰 생성</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-on-surface mb-1 block">쿠폰명</label>
                <input
                  type="text"
                  value={newCoupon.name}
                  onChange={(e) => setNewCoupon((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="예: 여름 특별 할인 쿠폰"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">쿠폰 코드</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono"
                    placeholder="SUMMER2026"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">할인 유형</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="정률">정률 (%)</option>
                    <option value="정액">정액 (원)</option>
                    <option value="배송비">배송비 할인</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">할인 값</label>
                  <input
                    type="text"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, discountValue: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="10% 또는 5000원"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">발급 수량 (0=무제한)</label>
                  <input
                    type="number"
                    value={newCoupon.issuedCount}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, issuedCount: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">시작일</label>
                  <input
                    type="date"
                    value={newCoupon.startDate}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-on-surface mb-1 block">종료일</label>
                  <input
                    type="date"
                    value={newCoupon.endDate}
                    onChange={(e) => setNewCoupon((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-on-surface mb-1 block">최소 주문 금액</label>
                <input
                  type="text"
                  value={newCoupon.minOrderAmount}
                  onChange={(e) => setNewCoupon((p) => ({ ...p, minOrderAmount: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="₩30,000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-outline-variant/20">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-outline-variant/40 hover:bg-surface-container transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleCreateCoupon}
                className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors"
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
