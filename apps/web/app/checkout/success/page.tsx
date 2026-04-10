'use client';

import Link from 'next/link';

const ORDER_NUMBER = 'YK20260410' + String(Math.floor(Math.random() * 900) + 100);
const ESTIMATED_DELIVERY = '4월 15일 (화) ~ 17일 (목)';

const ORDER_SUMMARY = [
  { label: '상품 금액', value: '359,000원' },
  { label: '배송비 (항공)', value: '19,250원' },
  { label: '예상 관부가세', value: '68,084원' },
  { label: '총 결제 금액', value: '446,334원', bold: true },
];

const NEXT_STEPS = [
  { icon: 'local_shipping', label: '배송 추적', description: '실시간 배송 현황을 확인하세요', href: '/orders' },
  { icon: 'receipt_long', label: '주문 상세', description: '주문 내역을 확인하세요', href: '/orders/ord1' },
  { icon: 'shopping_bag', label: '쇼핑 계속하기', description: '더 많은 상품을 둘러보세요', href: '/' },
];

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Success animation area */}
      <div className="bg-gradient-to-br from-primary to-primary-container text-white text-center py-12 px-6">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm animate-scale-in">
          <span className="material-symbols-outlined text-[48px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            check_circle
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2 animate-fade-in">
          주문이 완료되었습니다!
        </h1>
        <p className="text-white/80 text-sm animate-fade-in">
          주문해 주셔서 감사합니다
        </p>
      </div>

      <div className="p-4 space-y-3 -mt-4">
        {/* Order number card */}
        <section className="bg-white rounded-2xl p-5 shadow-soft animate-slide-up">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant mb-1">주문번호</p>
            <p className="font-heading font-bold text-lg text-on-surface tracking-wide">{ORDER_NUMBER}</p>
          </div>
          <div className="border-t border-outline-variant/20 mt-4 pt-4 flex items-center gap-3 justify-center">
            <span className="material-symbols-outlined text-tertiary text-[20px]">calendar_today</span>
            <div>
              <p className="text-xs text-on-surface-variant">예상 배송일</p>
              <p className="text-sm font-bold text-tertiary">{ESTIMATED_DELIVERY}</p>
            </div>
          </div>
        </section>

        {/* Order summary */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            결제 내역
          </h2>
          <div className="space-y-2.5">
            {ORDER_SUMMARY.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className={item.bold ? 'font-bold text-on-surface' : 'text-on-surface-variant'}>
                  {item.label}
                </span>
                <span className={item.bold ? 'font-heading font-extrabold text-primary text-lg' : 'text-on-surface'}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Points earned */}
        <section className="bg-gradient-to-r from-secondary/5 to-secondary/10 rounded-2xl p-4 border border-secondary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-secondary text-[20px]">stars</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-on-surface">적립금이 적립되었습니다</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                구매 확정 후 <span className="font-bold text-secondary">4,463원</span>이 적립됩니다
              </p>
            </div>
          </div>
        </section>

        {/* Next steps */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4">다음 단계</h2>
          <div className="space-y-3">
            {NEXT_STEPS.map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className="flex items-center gap-3 p-3 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low hover:border-primary/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-[20px]">{step.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">{step.label}</p>
                  <p className="text-xs text-on-surface-variant">{step.description}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[20px]">chevron_right</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
