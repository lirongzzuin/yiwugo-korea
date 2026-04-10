'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const TIMELINE_STEPS = [
  { status: 'completed', label: '주문 접수', date: '2026.04.08 14:23', description: '주문이 확인되었습니다' },
  { status: 'completed', label: '결제 완료', date: '2026.04.08 14:25', description: '토스페이로 결제되었습니다' },
  { status: 'completed', label: '이우 물류센터 입고', date: '2026.04.09 09:30', description: '상품 검수가 완료되었습니다' },
  { status: 'active', label: '국제 운송 중', date: '2026.04.10 06:00', description: '해상운송으로 한국으로 이동 중' },
  { status: 'pending', label: '인천 세관 통관', date: '', description: '통관 진행 예정' },
  { status: 'pending', label: '국내 배송', date: '', description: '택배 배송 예정' },
  { status: 'pending', label: '배송 완료', date: '', description: '' },
];

const ORDER_ITEMS = [
  { name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터', option: '실버 / 7포트', priceKRW: 18900, quantity: 10 },
  { name: '무선 블루투스 이어버드 TWS 5.3', option: '화이트', priceKRW: 8500, quantity: 20 },
];

export default function OrderDetailPage() {
  const router = useRouter();

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.priceKRW * i.quantity, 0);
  const shipping = 35000;
  const duty = 12100;
  const total = subtotal + shipping + duty;

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Top bar */}
      <div className="sticky top-14 md:top-16 z-10 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center h-12 px-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center font-heading font-bold text-base -ml-10">주문 상세</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Order header bento */}
        <section className="bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 text-white shadow-medium">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/70 text-xs mb-1">주문번호</p>
              <p className="font-heading font-bold text-lg">YWG-2026-041001</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold backdrop-blur-sm">
              International Transit
            </span>
          </div>
          <p className="text-white/80 text-sm mb-4">
            상품이 해상운송으로 한국을 향해 이동 중입니다
          </p>
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              Contact
            </button>
            <button className="flex-1 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/30 transition-all flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">receipt</span>
              Invoice
            </button>
          </div>
        </section>

        {/* Delivery estimate */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-[28px]">sailing</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-on-surface">예상 도착일</p>
              <p className="text-lg font-heading font-extrabold text-tertiary">4월 18일 (금) ~ 22일 (화)</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[16px]">local_shipping</span>
            <span className="text-xs text-on-surface-variant">해상운송 | 운송장: COSCO-YW2026041001</span>
          </div>
        </section>

        {/* Shipping journey map placeholder */}
        <section className="bg-white rounded-2xl overflow-hidden shadow-soft">
          <div className="h-40 bg-gradient-to-br from-tertiary/5 to-tertiary/15 flex items-center justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-12">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">flag</span>
                  </div>
                  <span className="text-[10px] text-tertiary font-medium">이우</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-16 h-0.5 bg-tertiary" />
                  <span className="material-symbols-outlined text-tertiary text-[20px] animate-pulse">sailing</span>
                  <div className="w-16 h-0.5 bg-outline-variant/30 border-dashed" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-outline-variant/30 text-on-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                  </div>
                  <span className="text-[10px] text-on-surface-variant font-medium">인천</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-5">
            <h3 className="font-heading font-bold text-sm text-on-surface mb-4">배송 여정</h3>
            <div className="space-y-0">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={i} className="flex gap-3">
                  {/* Timeline dot and line */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-3 h-3 rounded-full shrink-0 mt-1',
                      step.status === 'completed' && 'bg-green-500',
                      step.status === 'active' && 'bg-tertiary ring-4 ring-tertiary/20',
                      step.status === 'pending' && 'bg-outline-variant/40',
                    )} />
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div className={cn(
                        'w-0.5 flex-1 min-h-[28px]',
                        step.status === 'completed' ? 'bg-green-300' : 'bg-outline-variant/20'
                      )} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 -mt-0.5">
                    <p className={cn(
                      'text-sm font-semibold',
                      step.status === 'active' ? 'text-tertiary' : step.status === 'completed' ? 'text-on-surface' : 'text-on-surface-variant/50'
                    )}>
                      {step.label}
                    </p>
                    {step.date && (
                      <p className="text-xs text-on-surface-variant mt-0.5">{step.date}</p>
                    )}
                    {step.description && (
                      <p className={cn(
                        'text-xs mt-0.5',
                        step.status === 'pending' ? 'text-on-surface-variant/40' : 'text-on-surface-variant'
                      )}>
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Order items */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
            주문 상품
          </h3>
          <div className="space-y-3">
            {ORDER_ITEMS.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant/30 text-[28px]">image</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface line-clamp-1">{item.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{item.option}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold">{(item.priceKRW * item.quantity).toLocaleString()}원</span>
                    <span className="text-xs text-on-surface-variant">{item.quantity}개</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment summary */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h3 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            결제 내역
          </h3>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">상품 금액</span>
              <span className="text-on-surface">{subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">국제배송비</span>
              <span className="text-on-surface">{shipping.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">관부가세</span>
              <span className="text-on-surface">{duty.toLocaleString()}원</span>
            </div>
            <div className="border-t border-outline-variant/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">총 결제 금액</span>
                <span className="font-heading font-extrabold text-xl text-primary">
                  {total.toLocaleString()}원
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">토스페이 | 2026.04.08 결제</p>
            </div>
          </div>
        </section>

        {/* Support card */}
        <section className="bg-gradient-to-r from-surface-container to-surface-container-high rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[24px]">headset_mic</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm text-on-surface">도움이 필요하신가요?</p>
              <p className="text-xs text-on-surface-variant mt-0.5">주문 관련 문의는 고객센터로 연락해주세요</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-all shrink-0">
              문의하기
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
