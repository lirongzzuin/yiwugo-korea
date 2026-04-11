'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function KakaoPaySuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <KakaoPaySuccessContent />
    </Suspense>
  );
}

function KakaoPaySuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState('');

  const pgToken = searchParams.get('pg_token');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    async function approve() {
      if (!pgToken || !orderId) {
        setError('결제 정보가 올바르지 않습니다.');
        return;
      }

      try {
        const res = await fetch(`${API_URL}/payments/approve`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey: pgToken,
            orderId,
            amount: 0, // KakaoPay에서는 서버에서 금액 검증
          }),
        });

        if (res.ok) {
          router.replace(`/checkout/success?orderId=${orderId}&paymentKey=${pgToken}&amount=0`);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(data.message || '카카오페이 결제 승인 실패');
        }
      } catch {
        setError('카카오페이 결제 승인 중 오류 발생');
      }
    }

    approve();
  }, [pgToken, orderId, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-error text-[48px]">error</span>
          <p className="mt-4 text-on-surface">{error}</p>
          <button
            onClick={() => router.push('/checkout')}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-xl"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-on-surface-variant text-sm">카카오페이 결제를 확인하고 있습니다...</p>
      </div>
    </div>
  );
}
