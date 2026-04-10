'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface GuideSection {
  title: string;
  icon: string;
  content: string[];
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    title: '주문방법',
    icon: 'shopping_cart',
    content: [
      '1. 원하는 상품을 검색하거나 카테고리에서 찾아주세요.',
      '2. 상품 상세페이지에서 옵션(색상, 사이즈 등)과 수량을 선택하세요.',
      '3. MOQ(최소주문수량)를 확인하세요. 이우 도매 상품은 최소 주문 수량이 있습니다.',
      '4. 장바구니에 담거나 바로 주문하기를 클릭하세요.',
      '5. 배송지 정보와 개인통관고유부호를 입력하세요.',
      '6. 결제를 완료하면 주문이 접수됩니다.',
      '※ 여러 상점의 상품을 합포장하여 배송비를 절약할 수 있습니다.',
    ],
  },
  {
    title: '결제안내',
    icon: 'payments',
    content: [
      '지원 결제수단: 신용카드, 체크카드, 계좌이체, 가상계좌, 토스페이',
      '상품 가격은 중국 위안(CNY) 기준이며, 결제 시점의 실시간 환율이 적용됩니다.',
      '환율 변동으로 인한 소수점 차이가 발생할 수 있습니다.',
      '결제 완료 후 취소/환불은 주문 상태에 따라 처리됩니다.',
      '세금계산서 발행이 필요한 사업자 회원은 고객센터로 문의해주세요.',
      '정기 대량 구매 고객은 별도 결제 조건 협의가 가능합니다.',
    ],
  },
  {
    title: '배송안내',
    icon: 'local_shipping',
    content: [
      '배송 절차: 이우 현지 수거 → 검수/포장 → 국제운송 → 한국 통관 → 국내배송',
      '현지 수거: 결제 후 1~3일 (상점별 상이)',
      '국제운송: 항공 3~5일 / 해상 10~15일',
      '국내배송: 통관 후 1~2일 (CJ대한통운)',
      '합포장 서비스: 여러 상점 주문을 하나로 합포장하여 배송비 절약',
      '배송비는 중량(kg)과 부피(CBM) 중 큰 값을 기준으로 산정됩니다.',
      '실시간 배송 추적은 마이페이지 > 주문/배송 조회에서 확인하세요.',
    ],
  },
  {
    title: '통관안내',
    icon: 'gavel',
    content: [
      '개인통관고유부호가 필요합니다. (관세청 유니패스에서 발급)',
      '개인 사용 목적: 미화 $150 이하 면세 (미국발 $200 이하)',
      '사업자 수입: 관세 + 부가세(10%) 부과, 사업자등록증 필요',
      '식품, 의약품, 화장품 등 일부 품목은 별도 인허가가 필요합니다.',
      '통관 지연 시 관세사를 통해 대행 처리해드립니다.',
      '수입금지/제한 품목: 위조품, 마약류, 동식물 검역 대상 등',
      '통관 관련 문의는 고객센터 또는 담당 관세사에게 문의해주세요.',
    ],
  },
  {
    title: '반품/환불',
    icon: 'assignment_return',
    content: [
      '검수 단계에서 불량 발견 시: 무료 반품 및 교환 처리',
      '단순 변심: 이우 현지 발송 전에만 가능 (국제배송비 고객 부담)',
      '배송 중 파손: 사진 증빙 후 보상 처리 (수령 후 3일 이내 접수)',
      '환불 처리 기간: 접수 후 5~10영업일',
      '부분 환불: 합포장 주문 중 일부 상품만 환불 가능',
      '주문 취소: 결제 후 24시간 이내 전액 환불 가능',
      '※ 커스텀/주문제작 상품은 반품/환불이 제한됩니다.',
    ],
  },
];

function AccordionItem({ section }: { section: GuideSection }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-b border-outline-variant/20 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-primary text-[20px]">{section.icon}</span>
        </div>
        <span className="flex-1 font-heading font-bold text-base text-on-surface">{section.title}</span>
        <span
          className={cn(
            'material-symbols-outlined text-on-surface-variant text-[20px] transition-transform',
            isOpen && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 pt-0">
          <div className="ml-[52px] space-y-2.5">
            {section.content.map((line, i) => (
              <p key={i} className="text-sm text-on-surface-variant leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-xl text-on-surface">이용 가이드</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          이우고 코리아 이용 방법을 안내해드립니다.
        </p>
      </div>

      <div className="mt-2">
        {GUIDE_SECTIONS.map((section) => (
          <AccordionItem key={section.title} section={section} />
        ))}
      </div>

      {/* Help CTA */}
      <div className="mx-5 mt-6 p-5 rounded-2xl bg-primary/5 border border-primary/10 text-center">
        <span className="material-symbols-outlined text-primary text-[32px] mb-2">headset_mic</span>
        <p className="text-sm font-semibold text-on-surface mb-1">추가 문의사항이 있으신가요?</p>
        <p className="text-xs text-on-surface-variant mb-3">
          고객센터 운영시간: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)
        </p>
        <button className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
          고객센터 문의하기
        </button>
      </div>
    </div>
  );
}
