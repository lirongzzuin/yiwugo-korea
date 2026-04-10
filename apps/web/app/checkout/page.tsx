'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const MOCK_ITEMS = [
  {
    id: '1',
    name: 'USB-C 멀티 허브 7in1 4K HDMI 어댑터',
    option: '색상: 실버 / 모델: 7포트',
    priceKRW: 18900,
    quantity: 10,
    weightKg: 0.15,
    image: '',
  },
  {
    id: '2',
    name: '무선 블루투스 이어버드 TWS 5.3',
    option: '색상: 화이트',
    priceKRW: 8500,
    quantity: 20,
    weightKg: 0.08,
    image: '',
  },
];

const SHIPPING_STEPS = [
  { icon: 'fact_check', label: '이우물류센터\n검수' },
  { icon: 'sailing', label: '국제해상\n운송' },
  { icon: 'gavel', label: '인천세관\n통관' },
  { icon: 'local_shipping', label: '국내배송\n완료' },
];

const PAYMENT_METHODS = [
  { id: 'tosspay', icon: 'account_balance_wallet', label: '토스페이', color: '#0064FF' },
  { id: 'kakaopay', icon: 'chat_bubble', label: '카카오페이', color: '#FEE500' },
  { id: 'card', icon: 'credit_card', label: '신용/체크카드', color: '#5b403b' },
  { id: 'bank', icon: 'account_balance', label: '무통장입금', color: '#5b403b' },
];

const AIR_RATE_PER_KG = 5500;
const SEA_RATE_PER_KG = 2000;
const BASE_SHIPPING_FEE = 3000;
const USD_TO_KRW = 1380;
const DUTY_FREE_LIMIT_USD = 150;
const CUSTOMS_DUTY_RATE = 0.08;
const VAT_RATE = 0.10;

export default function CheckoutPage() {
  const router = useRouter();
  const [isOrderExpanded, setIsOrderExpanded] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState('tosspay');
  const [customsNumber, setCustomsNumber] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [usePoints, setUsePoints] = useState('');
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeOrder, setAgreeOrder] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<'AIR' | 'SEA'>('AIR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const costs = useMemo(() => {
    const subtotal = MOCK_ITEMS.reduce((sum, item) => sum + item.priceKRW * item.quantity, 0);
    const totalWeightKg = MOCK_ITEMS.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);
    const ratePerKg = shippingMethod === 'AIR' ? AIR_RATE_PER_KG : SEA_RATE_PER_KG;
    const shipping = Math.round(totalWeightKg * ratePerKg + BASE_SHIPPING_FEE);

    const totalValueUsd = Math.round(subtotal / USD_TO_KRW);
    const isDutyFree = totalValueUsd <= DUTY_FREE_LIMIT_USD;
    const customsDuty = isDutyFree ? 0 : Math.round((subtotal + shipping) * CUSTOMS_DUTY_RATE);
    const vat = isDutyFree ? 0 : Math.round((subtotal + shipping + customsDuty) * VAT_RATE);

    const couponDiscount = 0;
    const pointsDiscount = usePoints ? parseInt(usePoints) || 0 : 0;
    const total = subtotal + shipping + customsDuty + vat - couponDiscount - pointsDiscount;

    return {
      subtotal,
      shipping,
      customsDuty,
      vat,
      couponDiscount,
      pointsDiscount,
      total,
      totalValueUsd,
      isDutyFree,
      totalWeightKg,
      deliveryDays: shippingMethod === 'AIR' ? '3-5일' : '10-14일',
    };
  }, [shippingMethod, usePoints]);

  const handleAgreeAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreeOrder(next);
    setAgreeRefund(next);
  };

  const handleSubmit = async () => {
    if (!agreeOrder || !agreeRefund) return;
    setIsSubmitting(true);
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push('/checkout/success');
  };

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-outline-variant/30">
        <div className="flex items-center h-14 px-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="flex-1 text-center font-heading font-bold text-lg -ml-10">주문/결제</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="space-y-3 p-4">
        {/* Section 1: 배송지 정보 */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
              배송지 정보
            </h2>
            <button className="text-sm text-primary font-semibold hover:underline">변경</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-on-surface">홍길동</span>
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">기본</span>
            </div>
            <p className="text-sm text-on-surface-variant">010-1234-5678</p>
            <p className="text-sm text-on-surface-variant">서울특별시 강남구 테헤란로 123 우성아파트 102동 1504호</p>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/20">
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              개인통관고유부호 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="P로 시작하는 13자리"
              value={customsNumber}
              onChange={(e) => setCustomsNumber(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <p className="text-[11px] text-on-surface-variant mt-1.5">
              관세청에서 발급받은 개인통관고유부호를 입력해주세요
            </p>
          </div>
        </section>

        {/* Section 2: 주문 상품 */}
        <section className="bg-white rounded-2xl shadow-soft overflow-hidden">
          <button
            onClick={() => setIsOrderExpanded(!isOrderExpanded)}
            className="flex items-center justify-between w-full px-5 py-4"
          >
            <h2 className="font-heading font-bold text-base flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">shopping_bag</span>
              주문 상품
              <span className="text-sm font-normal text-on-surface-variant">({MOCK_ITEMS.length})</span>
            </h2>
            <span className={cn(
              'material-symbols-outlined text-on-surface-variant transition-transform duration-200',
              isOrderExpanded && 'rotate-180'
            )}>
              expand_more
            </span>
          </button>
          {isOrderExpanded && (
            <div className="px-5 pb-4 space-y-3">
              {MOCK_ITEMS.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-surface-variant/30 text-[28px]">image</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-on-surface line-clamp-1">{item.name}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{item.option}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-bold text-on-surface">
                        {(item.priceKRW * item.quantity).toLocaleString()}원
                      </span>
                      <span className="text-xs text-on-surface-variant">{item.quantity}개</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: 배송 방법 선택 */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
            배송 방법 선택
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setShippingMethod('AIR')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                shippingMethod === 'AIR'
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/30 hover:border-outline-variant'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[24px] text-primary">flight</span>
                <span className="font-bold text-sm text-on-surface">항공 특송</span>
              </div>
              <p className="text-xs text-on-surface-variant">3-5일 소요</p>
              <p className="text-sm font-semibold text-on-surface mt-1">
                {Math.round(costs.totalWeightKg * AIR_RATE_PER_KG + BASE_SHIPPING_FEE).toLocaleString()}원
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-secondary/10 text-secondary text-[10px] font-semibold">
                빠른 배송
              </span>
            </button>
            <button
              onClick={() => setShippingMethod('SEA')}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-200 text-left',
                shippingMethod === 'SEA'
                  ? 'border-primary bg-primary/5'
                  : 'border-outline-variant/30 hover:border-outline-variant'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[24px] text-tertiary">sailing</span>
                <span className="font-bold text-sm text-on-surface">해운 일반</span>
              </div>
              <p className="text-xs text-on-surface-variant">10-14일 소요</p>
              <p className="text-sm font-semibold text-on-surface mt-1">
                {Math.round(costs.totalWeightKg * SEA_RATE_PER_KG + BASE_SHIPPING_FEE).toLocaleString()}원
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-tertiary/10 text-tertiary text-[10px] font-semibold">
                경제적
              </span>
            </button>
          </div>
        </section>

        {/* Section 4: 국제배송 안내 */}
        <section className="bg-gradient-to-r from-tertiary/5 to-tertiary/10 rounded-2xl p-5 border border-tertiary/20">
          <h2 className="font-heading font-bold text-sm text-tertiary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">public</span>
            국제배송 안내
          </h2>
          <div className="flex items-center justify-between">
            {SHIPPING_STEPS.map((step, i) => (
              <div key={step.label} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center',
                    i === 0 ? 'bg-tertiary text-white' : 'bg-white text-tertiary border border-tertiary/30'
                  )}>
                    <span className="material-symbols-outlined text-[20px]">{step.icon}</span>
                  </div>
                  <span className="text-[10px] text-center text-on-surface-variant leading-tight whitespace-pre-line">
                    {step.label}
                  </span>
                </div>
                {i < SHIPPING_STEPS.length - 1 && (
                  <div className="w-full h-px bg-tertiary/20 -mt-5 mx-1" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-3 text-center">
            예상 소요기간: {shippingMethod === 'AIR' ? '항공 특송 기준 3~5영업일' : '해상운송 기준 10~14영업일'}
          </p>
        </section>

        {/* Customs duty warning */}
        {!costs.isDutyFree && (
          <section className="bg-secondary/5 rounded-2xl p-4 border border-secondary/20">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px] shrink-0">warning</span>
              <div>
                <p className="text-sm font-semibold text-on-surface">관부가세 부과 안내</p>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  주문 금액이 미화 $150을 초과하여 관세({(CUSTOMS_DUTY_RATE * 100).toFixed(0)}%)와
                  부가세({(VAT_RATE * 100).toFixed(0)}%)가 부과됩니다.
                  예상 관부가세: <span className="font-bold text-on-surface">{(costs.customsDuty + costs.vat).toLocaleString()}원</span>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Section 5: 결제 수단 */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
            결제 수단
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setSelectedPayment(method.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-200',
                  selectedPayment === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
                )}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ color: selectedPayment === method.id ? '#b32008' : method.color }}
                >
                  {method.icon}
                </span>
                <span className={cn(
                  'text-sm font-medium',
                  selectedPayment === method.id ? 'text-primary' : 'text-on-surface'
                )}>
                  {method.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 6: 쿠폰/적립금 */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">confirmation_number</span>
            쿠폰 / 적립금
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-on-surface-variant mb-1.5 block">쿠폰 코드</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="쿠폰 코드를 입력하세요"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 h-11 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button className="px-4 h-11 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-all">
                  적용
                </button>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm text-on-surface-variant">적립금 사용</label>
                <span className="text-xs text-on-surface-variant">보유 적립금: <span className="text-primary font-semibold">3,200원</span></span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="0"
                  value={usePoints}
                  onChange={(e) => setUsePoints(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 h-11 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
                <button className="px-4 h-11 rounded-xl border border-outline-variant/40 text-on-surface-variant text-sm font-semibold hover:bg-surface-container transition-all">
                  전액 사용
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 7: 최종 결제 금액 */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <h2 className="font-heading font-bold text-base mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">receipt_long</span>
            최종 결제 금액
          </h2>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant">상품 금액</span>
              <span className="text-on-surface">{costs.subtotal.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-on-surface-variant flex items-center gap-1">
                배송비
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  {shippingMethod === 'AIR' ? '항공' : '해운'}
                </span>
              </span>
              <span className="text-on-surface">{costs.shipping.toLocaleString()}원</span>
            </div>
            {costs.customsDuty > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">예상 관세 (8%)</span>
                <span className="text-on-surface">{costs.customsDuty.toLocaleString()}원</span>
              </div>
            )}
            {costs.vat > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">예상 부가세 (10%)</span>
                <span className="text-on-surface">{costs.vat.toLocaleString()}원</span>
              </div>
            )}
            {costs.isDutyFree && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">관부가세</span>
                <span className="text-green-600 font-medium">면세 (US${costs.totalValueUsd} / $150 이하)</span>
              </div>
            )}
            {costs.couponDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">쿠폰 할인</span>
                <span className="text-primary">-{costs.couponDiscount.toLocaleString()}원</span>
              </div>
            )}
            {costs.pointsDiscount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">적립금 할인</span>
                <span className="text-primary">-{costs.pointsDiscount.toLocaleString()}원</span>
              </div>
            )}
            <div className="border-t border-outline-variant/30 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-on-surface">총 결제 금액</span>
                <span className="font-heading font-extrabold text-xl text-primary">
                  {costs.total.toLocaleString()}원
                </span>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-1 text-right">
                VAT 포함 | 예상 배송 {costs.deliveryDays}
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Terms */}
        <section className="bg-white rounded-2xl p-5 shadow-soft">
          <label className="flex items-center gap-3 cursor-pointer pb-3 mb-3 border-b border-outline-variant/20">
            <button
              type="button"
              onClick={handleAgreeAll}
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                agreeAll ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent'
              )}
            >
              {agreeAll && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
            </button>
            <span className="text-sm font-bold text-on-surface">주문 내용 확인 및 결제 동의</span>
          </label>
          {[
            { state: agreeOrder, setter: setAgreeOrder, label: '구매조건 확인 및 결제대행 서비스 약관 동의 (필수)' },
            { state: agreeRefund, setter: setAgreeRefund, label: '개인정보 제3자 제공 및 취소/환불 규정 동의 (필수)' },
          ].map(({ state, setter, label }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer py-1.5">
              <button
                type="button"
                onClick={() => { setter(!state); if (agreeAll && state) setAgreeAll(false); }}
                className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                  state ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent'
                )}
              >
                {state && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
              </button>
              <span className="text-xs text-on-surface-variant">{label}</span>
            </label>
          ))}
        </section>
      </div>

      {/* Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 shadow-strong">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <button
            disabled={!agreeOrder || !agreeRefund || isSubmitting}
            onClick={handleSubmit}
            className={cn(
              'w-full h-13 py-3.5 rounded-xl font-bold text-base text-white transition-all duration-200 flex items-center justify-center gap-2',
              agreeOrder && agreeRefund && !isSubmitting
                ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
                : 'bg-outline-variant/60 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                결제 처리 중...
              </>
            ) : (
              `${costs.total.toLocaleString()}원 결제하기`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
