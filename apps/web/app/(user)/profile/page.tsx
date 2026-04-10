'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const ORDER_FLOW = [
  { label: '결제완료', count: 1, icon: 'credit_score' },
  { label: '배송중', count: 1, icon: 'local_shipping' },
  { label: '통관중', count: 1, icon: 'gavel' },
  { label: '배송완료', count: 3, icon: 'inventory_2' },
];

const MENU_GROUPS = [
  {
    items: [
      { icon: 'local_shipping', label: '주문/배송 조회', href: '/orders' },
      { icon: 'favorite', label: '관심상품', href: '/wishlist' },
      { icon: 'history', label: '최근 본 상품', href: '#' },
    ],
  },
  {
    items: [
      { icon: 'rate_review', label: '나의 리뷰', href: '#' },
      { icon: 'confirmation_number', label: '쿠폰함', href: '#' },
      { icon: 'savings', label: '적립금 내역', href: '#' },
    ],
  },
  {
    items: [
      { icon: 'location_on', label: '배송지 관리', href: '#' },
      { icon: 'badge', label: '개인통관고유부호', href: '#' },
      { icon: 'headset_mic', label: '고객센터', href: '#' },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Profile Section */}
      <section className="bg-white px-5 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-medium">
            <span className="material-symbols-outlined text-white text-[32px]">person</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-lg font-bold text-on-surface">홍길동</h1>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">
                개인 구매자
              </span>
            </div>
            <p className="text-sm text-on-surface-variant mt-0.5">hong@example.com</p>
          </div>
          <Link
            href="#"
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">settings</span>
          </Link>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-3 mt-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 overflow-hidden">
          {[
            { label: '적립금', value: '3,200원', icon: 'savings' },
            { label: '쿠폰함', value: '2장', icon: 'confirmation_number' },
            { label: '찜한상품', value: '12개', icon: 'favorite' },
          ].map((item, i) => (
            <Link
              key={item.label}
              href="#"
              className={cn(
                'flex flex-col items-center py-4 hover:bg-surface-container transition-colors',
                i < 2 && 'border-r border-outline-variant/30'
              )}
            >
              <span className="material-symbols-outlined text-primary text-[20px] mb-1">{item.icon}</span>
              <span className="text-base font-bold text-on-surface">{item.value}</span>
              <span className="text-[11px] text-on-surface-variant mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Order status flow */}
      <section className="bg-white mt-2 px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-base">주문 현황</h2>
          <Link href="/orders" className="text-sm text-primary font-semibold hover:underline flex items-center gap-0.5">
            전체보기
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
        <div className="flex items-center justify-between relative">
          {/* Connective line */}
          <div className="absolute top-5 left-[12%] right-[12%] h-0.5 bg-outline-variant/30" />

          {ORDER_FLOW.map((step) => (
            <div key={step.label} className="flex flex-col items-center gap-1.5 relative z-10 flex-1">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                step.count > 0
                  ? 'bg-primary/10 text-primary'
                  : 'bg-surface-container text-on-surface-variant/40'
              )}>
                <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
              </div>
              <span className={cn(
                'text-lg font-heading font-extrabold',
                step.count > 0 ? 'text-primary' : 'text-on-surface-variant/40'
              )}>
                {step.count}
              </span>
              <span className="text-[11px] text-on-surface-variant">{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Menu sections */}
      <div className="mt-2 space-y-2">
        {MENU_GROUPS.map((group, gi) => (
          <section key={gi} className="bg-white">
            {group.items.map((item, i) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-5 py-3.5 hover:bg-surface-container-low transition-colors',
                  i < group.items.length - 1 && 'border-b border-outline-variant/20'
                )}
              >
                <span className="material-symbols-outlined text-on-surface-variant text-[22px]">{item.icon}</span>
                <span className="flex-1 text-sm font-medium text-on-surface">{item.label}</span>
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">chevron_right</span>
              </Link>
            ))}
          </section>
        ))}
      </div>

      {/* Logout */}
      <div className="mt-2 bg-white">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-3 px-5 py-3.5 w-full hover:bg-surface-container-low transition-colors"
        >
          <span className="material-symbols-outlined text-error text-[22px]">logout</span>
          <span className="text-sm font-medium text-error">로그아웃</span>
        </button>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-on-surface-variant/40 mt-6 mb-4">
        YiwuGo Korea v1.0.0
      </p>
    </div>
  );
}
