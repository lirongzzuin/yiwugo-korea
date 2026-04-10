'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/cn';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string;
  date: string;
  [key: string]: unknown;
}

const statusOptions = [
  { value: '', label: '전체 상태' },
  { value: '결제대기', label: '결제대기' },
  { value: '결제완료', label: '결제완료' },
  { value: '구매대행중', label: '구매대행중' },
  { value: '검수중', label: '검수중' },
  { value: '배송중', label: '배송중' },
  { value: '배송완료', label: '배송완료' },
  { value: '환불요청', label: '환불요청' },
  { value: '취소', label: '취소' },
];

const statusColors: Record<string, string> = {
  '결제대기': 'bg-gray-100 text-gray-700',
  '결제완료': 'bg-blue-100 text-blue-700',
  '구매대행중': 'bg-indigo-100 text-indigo-700',
  '검수중': 'bg-purple-100 text-purple-700',
  '배송중': 'bg-amber-100 text-amber-700',
  '배송완료': 'bg-green-100 text-green-700',
  '환불요청': 'bg-red-100 text-red-700',
  '취소': 'bg-gray-200 text-gray-500',
};

const mockOrders: Order[] = [
  { id: 'ORD-240410-001', customer: '김민수', product: '실리콘 주방용품 5종 세트 외 2건', amount: '₩458,000', status: '결제완료', date: '2026-04-10 14:23' },
  { id: 'ORD-240410-002', customer: '이지영', product: 'LED 미니 프로젝터', amount: '₩1,665,000', status: '배송중', date: '2026-04-10 13:15' },
  { id: 'ORD-240410-003', customer: '박서준', product: '무선 블루투스 이어폰 50개', amount: '₩224,000', status: '검수중', date: '2026-04-10 11:42' },
  { id: 'ORD-240409-021', customer: '최예린', product: '스테인리스 텀블러 500ml 100개', amount: '₩2,862,000', status: '배송완료', date: '2026-04-09 18:30' },
  { id: 'ORD-240409-020', customer: '정하늘', product: '접이식 캠핑 의자 20개', amount: '₩711,000', status: '결제완료', date: '2026-04-09 16:55' },
  { id: 'ORD-240409-019', customer: '한지민', product: '미니 가습기 30개', amount: '₩345,000', status: '구매대행중', date: '2026-04-09 15:20' },
  { id: 'ORD-240409-018', customer: '송민호', product: '실리콘 폰케이스 200개', amount: '₩980,000', status: '결제대기', date: '2026-04-09 14:10' },
  { id: 'ORD-240408-015', customer: '윤서아', product: 'USB-C 멀티 허브 외 1건', amount: '₩1,230,000', status: '환불요청', date: '2026-04-08 12:00' },
  { id: 'ORD-240408-014', customer: '강태우', product: '아크릴 진열대 50개', amount: '₩520,000', status: '배송완료', date: '2026-04-08 10:30' },
  { id: 'ORD-240408-013', customer: '오수빈', product: '자석 케이블 정리함 100개', amount: '₩280,000', status: '취소', date: '2026-04-08 09:15' },
  { id: 'ORD-240407-012', customer: '임도현', product: '접이식 우산 60개', amount: '₩432,000', status: '배송완료', date: '2026-04-07 17:45' },
  { id: 'ORD-240407-011', customer: '배수지', product: 'LED 조명 스트립 5m 40개', amount: '₩688,000', status: '배송완료', date: '2026-04-07 14:20' },
];

const columns: Column<Order>[] = [
  {
    key: 'id',
    label: '주문번호',
    sortable: true,
    render: (row) => (
      <span className="font-mono text-xs text-primary font-medium">{row.id}</span>
    ),
  },
  { key: 'customer', label: '고객', sortable: true },
  {
    key: 'product',
    label: '상품',
    render: (row) => (
      <span className="max-w-[200px] truncate block">{row.product}</span>
    ),
  },
  {
    key: 'amount',
    label: '결제금액',
    sortable: true,
    render: (row) => <span className="font-medium">{row.amount}</span>,
  },
  {
    key: 'status',
    label: '상태',
    render: (row) => (
      <span
        className={cn(
          'px-2.5 py-1 text-xs font-medium rounded-full',
          statusColors[row.status] || 'bg-gray-100 text-gray-600'
        )}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: 'date',
    label: '주문일시',
    sortable: true,
    render: (row) => <span className="text-xs text-on-surface-variant">{row.date}</span>,
  },
  {
    key: 'actions',
    label: '액션',
    render: () => (
      <div className="flex items-center gap-1">
        <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="상세보기">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">visibility</span>
        </button>
        <button className="p-1.5 rounded-lg hover:bg-surface-container transition-colors" title="상태변경">
          <span className="material-symbols-outlined text-lg text-on-surface-variant">edit</span>
        </button>
      </div>
    ),
  },
];

export default function AdminOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filtered = mockOrders.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (search && !order.id.toLowerCase().includes(search.toLowerCase()) && !order.customer.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="주문 관리"
        description="전체 주문 내역을 조회하고 관리합니다."
        actions={
          <div className="flex items-center gap-2">
            <select className="px-3 py-2 text-sm border border-outline-variant/40 rounded-xl bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">일괄 작업</option>
              <option value="confirm">구매확정 처리</option>
              <option value="ship">배송 처리</option>
              <option value="cancel">주문 취소</option>
            </select>
            <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">download</span>
              엑셀 다운로드
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            placeholder="주문번호 또는 고객명 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <input
          type="date"
          className="px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Table */}
      <DataTable columns={columns} data={filtered} pageSize={10} />
    </div>
  );
}
