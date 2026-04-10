'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

const TABS = ['전체', '결제완료', '배송중', '통관중', '배송완료'] as const;

type OrderStatus = typeof TABS[number];

interface OrderItem {
  name: string;
  option: string;
  priceKRW: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
}

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string }> = {
  '전체': { bg: 'bg-surface-container', text: 'text-on-surface' },
  '결제완료': { bg: 'bg-blue-50', text: 'text-blue-700' },
  '배송중': { bg: 'bg-orange-50', text: 'text-orange-700' },
  '통관중': { bg: 'bg-purple-50', text: 'text-purple-700' },
  '배송완료': { bg: 'bg-green-50', text: 'text-green-700' },
};

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord1',
    orderNumber: 'YWG-2026-041001',
    date: '2026.04.08',
    status: '배송중',
    items: [
      { name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터', option: '실버 / 7포트', priceKRW: 189000, quantity: 10 },
      { name: '무선 블루투스 이어버드 TWS 5.3', option: '화이트', priceKRW: 170000, quantity: 20 },
    ],
  },
  {
    id: 'ord2',
    orderNumber: 'YWG-2026-040502',
    date: '2026.04.05',
    status: '통관중',
    items: [
      { name: '여성 캐주얼 니트 가디건 오버핏', option: '베이지 / Free', priceKRW: 62000, quantity: 5 },
    ],
  },
  {
    id: 'ord3',
    orderNumber: 'YWG-2026-040103',
    date: '2026.04.01',
    status: '배송완료',
    items: [
      { name: '실리콘 주방용품 세트 12종', option: '민트', priceKRW: 95000, quantity: 15 },
    ],
  },
  {
    id: 'ord4',
    orderNumber: 'YWG-2026-032804',
    date: '2026.03.28',
    status: '결제완료',
    items: [
      { name: 'LED 데스크 램프 무선충전 3in1', option: '블랙', priceKRW: 245000, quantity: 8 },
    ],
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('전체');

  const filteredOrders = activeTab === '전체'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter((o) => o.status === activeTab);

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto">
      {/* Header */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30">
        <div className="px-5 pt-4 pb-0">
          <h1 className="font-heading text-xl font-bold mb-4">주문/배송 조회</h1>
          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-3">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                  activeTab === tab
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order list */}
      <div className="p-4 space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px] mb-3">
              inbox
            </span>
            <p className="text-sm text-on-surface-variant">해당 상태의 주문이 없습니다</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-outline-variant/30 overflow-hidden shadow-soft hover:shadow-medium transition-all"
            >
              {/* Order header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/20 bg-surface-container-low">
                <div>
                  <p className="text-xs text-on-surface-variant">{order.date}</p>
                  <p className="text-sm font-semibold text-on-surface mt-0.5">{order.orderNumber}</p>
                </div>
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  STATUS_STYLES[order.status].bg,
                  STATUS_STYLES[order.status].text,
                )}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="p-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant/30 text-[28px]">image</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-on-surface line-clamp-1">{item.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.option}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-sm font-bold text-on-surface">
                          {item.priceKRW.toLocaleString()}원
                        </span>
                        <span className="text-xs text-on-surface-variant">{item.quantity}개</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 px-4 pb-4">
                {order.status === '배송완료' && (
                  <>
                    <button className="flex-1 py-2.5 rounded-xl border border-outline-variant/40 text-sm font-semibold text-on-surface hover:bg-surface-container transition-all">
                      리뷰 작성
                    </button>
                    <button className="flex-1 py-2.5 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary/5 transition-all">
                      재주문
                    </button>
                  </>
                )}
                {order.status === '배송중' && (
                  <button className="flex-1 py-2.5 rounded-xl border border-primary text-sm font-semibold text-primary hover:bg-primary/5 transition-all">
                    배송 추적
                  </button>
                )}
                {order.status === '결제완료' && (
                  <button className="flex-1 py-2.5 rounded-xl border border-error text-sm font-semibold text-error hover:bg-error/5 transition-all">
                    주문 취소
                  </button>
                )}
                {order.status === '통관중' && (
                  <button className="flex-1 py-2.5 rounded-xl border border-tertiary text-sm font-semibold text-tertiary hover:bg-tertiary/5 transition-all">
                    통관 상세
                  </button>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
