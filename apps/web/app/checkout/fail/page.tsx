'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-error/30 border-t-error rounded-full animate-spin mx-auto" />
      </div>
    }>
      <CheckoutFailContent />
    </Suspense>
  );
}

function CheckoutFailContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const errorMessages: Record<string, string> = {
    PAY_PROCESS_CANCELED: '결제가 취소되었습니다.',
    PAY_PROCESS_ABORTED: '결제가 중단되었습니다.',
    REJECT_CARD_COMPANY: '카드사에서 결제를 거절했습니다.',
    BELOW_MINIMUM_AMOUNT: '최소 결제 금액 이하입니다.',
    EXCEED_MAX_CARD_INSTALLMENT_PLAN: '할부 개월 수가 초과되었습니다.',
    NOT_ALLOWED_POINT_USE: '포인트 사용이 불가합니다.',
    INVALID_CARD_EXPIRATION: '카드 유효기간이 만료되었습니다.',
    INVALID_STOPPED_CARD: '정지된 카드입니다.',
    EXCEED_MAX_DAILY_PAYMENT_COUNT: '일일 결제 한도를 초과했습니다.',
    EXCEED_MAX_PAYMENT_AMOUNT: '결제 한도를 초과했습니다.',
    NOT_AVAILABLE_BANK: '은행 점검 시간입니다.',
  };

  const displayMessage = code
    ? errorMessages[code] || message || '결제 처리 중 오류가 발생했습니다.'
    : message || '결제 처리 중 오류가 발생했습니다.';

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Error header */}
      <div className="bg-gradient-to-br from-error/90 to-error/70 text-white text-center py-12 px-6">
        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
          <span className="material-symbols-outlined text-[48px] text-white">cancel</span>
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2">결제에 실패했습니다</h1>
        <p className="text-white/80 text-sm">아래 내용을 확인해 주세요</p>
      </div>

      <div className="p-4 space-y-3 -mt-4">
        {/* Error details */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[20px]">info</span>
            오류 상세
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">오류 메시지</span>
              <span className="text-on-surface text-right max-w-[60%]">{displayMessage}</span>
            </div>
            {code && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">오류 코드</span>
                <span className="text-on-surface font-mono text-xs">{code}</span>
              </div>
            )}
            {orderId && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">주문번호</span>
                <span className="text-on-surface font-mono text-xs">{orderId}</span>
              </div>
            )}
          </div>
        </section>

        {/* Help section */}
        <section className="bg-secondary/5 rounded-2xl p-4 border border-secondary/20">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[24px] shrink-0">help</span>
            <div>
              <p className="text-sm font-semibold text-on-surface">문제가 지속되나요?</p>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                카드 한도, 결제 비밀번호, 공인인증서 등을 확인해 주세요.
                문제가 계속되면 카드사 또는 고객센터로 문의해 주세요.
              </p>
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          <Link
            href="/checkout"
            className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-base text-center hover:shadow-medium transition-all"
          >
            다시 결제하기
          </Link>
          <Link
            href="/cart"
            className="block w-full py-3.5 rounded-xl border-2 border-outline-variant/40 text-on-surface font-bold text-base text-center hover:bg-surface-container transition-all"
          >
            장바구니로 돌아가기
          </Link>
          <Link
            href="/"
            className="block w-full py-3.5 rounded-xl text-on-surface-variant font-medium text-sm text-center hover:text-on-surface transition-all"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
