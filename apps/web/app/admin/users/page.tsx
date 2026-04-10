'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { Column } from '@/components/admin/DataTable';
import { cn } from '@/lib/cn';

interface User {
  id: string;
  name: string;
  email: string;
  memberType: string;
  role: string;
  joinDate: string;
  lastLogin: string;
  status: string;
  phone?: string;
  orderCount?: number;
  totalSpent?: string;
  [key: string]: unknown;
}

const mockUsers: User[] = [
  { id: 'U001', name: '김민수', email: 'minsu@example.com', memberType: '사업자', role: '일반', joinDate: '2025-12-15', lastLogin: '2026-04-10 14:00', status: '활성', phone: '010-1234-5678', orderCount: 15, totalSpent: '₩8,450,000' },
  { id: 'U002', name: '이지영', email: 'jiyoung@example.com', memberType: '개인', role: '일반', joinDate: '2026-01-08', lastLogin: '2026-04-10 12:30', status: '활성', phone: '010-2345-6789', orderCount: 8, totalSpent: '₩3,200,000' },
  { id: 'U003', name: '박서준', email: 'seojun@example.com', memberType: '사업자', role: 'VIP', joinDate: '2025-09-20', lastLogin: '2026-04-09 18:00', status: '활성', phone: '010-3456-7890', orderCount: 42, totalSpent: '₩25,600,000' },
  { id: 'U004', name: '최예린', email: 'yerin@example.com', memberType: '개인', role: '일반', joinDate: '2026-02-14', lastLogin: '2026-04-08 09:15', status: '활성', phone: '010-4567-8901', orderCount: 3, totalSpent: '₩980,000' },
  { id: 'U005', name: '정하늘', email: 'haneul@example.com', memberType: '사업자', role: '일반', joinDate: '2026-03-01', lastLogin: '2026-04-07 16:45', status: '휴면', phone: '010-5678-9012', orderCount: 1, totalSpent: '₩350,000' },
  { id: 'U006', name: '한지민', email: 'jimin@example.com', memberType: '개인', role: '일반', joinDate: '2025-11-30', lastLogin: '2026-03-15 10:20', status: '정지', phone: '010-6789-0123', orderCount: 0, totalSpent: '₩0' },
  { id: 'U007', name: '송민호', email: 'minho@example.com', memberType: '사업자', role: 'VIP', joinDate: '2025-08-10', lastLogin: '2026-04-10 09:00', status: '활성', phone: '010-7890-1234', orderCount: 67, totalSpent: '₩45,200,000' },
  { id: 'U008', name: '윤서아', email: 'seoa@example.com', memberType: '개인', role: '일반', joinDate: '2026-03-20', lastLogin: '2026-04-09 14:30', status: '활성', phone: '010-8901-2345', orderCount: 5, totalSpent: '₩1,500,000' },
];

const statusColors: Record<string, string> = {
  '활성': 'bg-green-100 text-green-700',
  '휴면': 'bg-amber-100 text-amber-700',
  '정지': 'bg-red-100 text-red-700',
};

const roleColors: Record<string, string> = {
  '일반': 'bg-gray-100 text-gray-600',
  'VIP': 'bg-amber-100 text-amber-700',
  '관리자': 'bg-primary/10 text-primary',
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filtered = mockUsers.filter((user) => {
    if (search && !user.name.includes(search) && !user.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter && user.role !== roleFilter) return false;
    if (typeFilter && user.memberType !== typeFilter) return false;
    return true;
  });

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: '이름',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold text-xs">{row.name[0]}</span>
          </div>
          <span className="font-medium text-on-surface">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: '이메일',
      render: (row) => <span className="text-on-surface-variant">{row.email}</span>,
    },
    {
      key: 'memberType',
      label: '유형',
      render: (row) => (
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-md', row.memberType === '사업자' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600')}>
          {row.memberType}
        </span>
      ),
    },
    {
      key: 'role',
      label: '역할',
      render: (row) => (
        <span className={cn('px-2 py-0.5 text-xs font-medium rounded-md', roleColors[row.role] || '')}>
          {row.role}
        </span>
      ),
    },
    { key: 'joinDate', label: '가입일', sortable: true },
    {
      key: 'lastLogin',
      label: '최근 로그인',
      render: (row) => <span className="text-xs text-on-surface-variant">{row.lastLogin}</span>,
    },
    {
      key: 'status',
      label: '상태',
      render: (row) => (
        <span className={cn('px-2.5 py-1 text-xs font-medium rounded-full', statusColors[row.status] || '')}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setSelectedUser(row); }}
          className="p-1.5 rounded-lg hover:bg-surface-container transition-colors"
          title="상세보기"
        >
          <span className="material-symbols-outlined text-lg text-on-surface-variant">more_vert</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="회원 관리"
        description="전체 회원을 조회하고 관리합니다."
        actions={
          <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors flex items-center gap-1.5">
            <span className="material-symbols-outlined text-lg">download</span>
            회원 목록 다운로드
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            type="text"
            placeholder="이름 또는 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">전체 역할</option>
          <option value="일반">일반</option>
          <option value="VIP">VIP</option>
          <option value="관리자">관리자</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2.5 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">전체 유형</option>
          <option value="개인">개인</option>
          <option value="사업자">사업자</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} onRowClick={(row) => setSelectedUser(row)} />

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-strong animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold font-heading">회원 상세 정보</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 rounded-lg hover:bg-surface-container">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">{selectedUser.name[0]}</span>
                </div>
                <div>
                  <p className="text-lg font-bold text-on-surface">{selectedUser.name}</p>
                  <p className="text-sm text-on-surface-variant">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '전화번호', value: selectedUser.phone },
                  { label: '회원 유형', value: selectedUser.memberType },
                  { label: '역할', value: selectedUser.role },
                  { label: '상태', value: selectedUser.status },
                  { label: '가입일', value: selectedUser.joinDate },
                  { label: '최근 로그인', value: selectedUser.lastLogin },
                  { label: '주문 횟수', value: `${selectedUser.orderCount}건` },
                  { label: '총 구매액', value: selectedUser.totalSpent },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-on-surface-variant mb-1">{item.label}</p>
                    <p className="text-sm font-medium text-on-surface">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <select className="flex-1 px-3 py-2 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>상태 변경</option>
                  <option value="활성">활성</option>
                  <option value="휴면">휴면</option>
                  <option value="정지">정지</option>
                </select>
                <select className="flex-1 px-3 py-2 text-sm border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option>역할 변경</option>
                  <option value="일반">일반</option>
                  <option value="VIP">VIP</option>
                  <option value="관리자">관리자</option>
                </select>
                <button className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors">
                  저장
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
