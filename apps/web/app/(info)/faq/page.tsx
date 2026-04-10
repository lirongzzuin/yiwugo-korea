'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

const CATEGORIES = ['전체', '주문', '배송', '결제', '통관', '회원'] as const;
type Category = (typeof CATEGORIES)[number];

interface FaqItem {
  category: Exclude<Category, '전체'>;
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: '주문',
    question: 'MOQ(최소주문수량)는 무엇인가요?',
    answer:
      'MOQ(Minimum Order Quantity)는 최소 주문 수량을 의미합니다. 이우 도매 시장의 특성상 각 상품별로 최소 주문 수량이 정해져 있습니다. 상품 상세페이지에서 해당 상품의 MOQ를 확인하실 수 있으며, MOQ 미만 주문 시 단가가 상승할 수 있습니다.',
  },
  {
    category: '주문',
    question: '여러 상점의 상품을 한 번에 주문할 수 있나요?',
    answer:
      '네, 가능합니다. 서로 다른 상점의 상품을 장바구니에 담아 한 번에 결제할 수 있습니다. 이우고 코리아가 각 상점에서 상품을 수거하여 합포장 후 한국으로 발송하므로 배송비를 절약하실 수 있습니다.',
  },
  {
    category: '주문',
    question: '주문 후 취소가 가능한가요?',
    answer:
      '결제 후 24시간 이내에는 전액 환불이 가능합니다. 이우 현지에서 상품 수거가 시작된 이후에는 취소가 제한되며, 국제배송비가 발생할 수 있습니다. 커스텀/주문제작 상품은 취소가 불가합니다.',
  },
  {
    category: '배송',
    question: '배송은 얼마나 걸리나요?',
    answer:
      '일반적으로 결제 완료 후 총 7~15일 정도 소요됩니다. 현지 수거(1~3일) → 검수/포장(1~2일) → 국제운송(항공 3~5일 / 해상 10~15일) → 통관(1~3일) → 국내배송(1~2일) 순서로 진행됩니다.',
  },
  {
    category: '배송',
    question: '배송비는 어떻게 계산되나요?',
    answer:
      '배송비는 중량(kg)과 부피(CBM) 중 큰 값을 기준으로 산정됩니다. 항공운송은 kg당 약 5,000~8,000원, 해상운송은 CBM당 약 150,000~250,000원입니다. 합포장 시 배송비를 절약할 수 있습니다.',
  },
  {
    category: '배송',
    question: '배송 추적은 어떻게 하나요?',
    answer:
      '마이페이지 > 주문/배송 조회에서 실시간으로 배송 상태를 확인하실 수 있습니다. 현지 수거부터 국내 배송 완료까지 전 과정의 상태가 업데이트됩니다.',
  },
  {
    category: '결제',
    question: '어떤 결제수단을 사용할 수 있나요?',
    answer:
      '신용카드, 체크카드, 계좌이체, 가상계좌, 토스페이를 지원합니다. 사업자 회원은 세금계산서 발행이 가능하며, 정기 대량 구매 고객은 별도 결제 조건 협의가 가능합니다.',
  },
  {
    category: '결제',
    question: '환율은 어떻게 적용되나요?',
    answer:
      '결제 시점의 실시간 환율이 적용됩니다. 상품 가격은 중국 위안(CNY) 기준이며, 원화(KRW)로 환산되어 결제됩니다. 환율 변동으로 인한 소수점 차이가 발생할 수 있습니다.',
  },
  {
    category: '통관',
    question: '개인통관고유부호는 어디서 발급받나요?',
    answer:
      '관세청 유니패스(unipass.customs.go.kr)에서 무료로 발급받을 수 있습니다. 개인 구매 시 반드시 필요하며, 주문 시 입력해주셔야 합니다.',
  },
  {
    category: '통관',
    question: '관세는 얼마나 부과되나요?',
    answer:
      '개인 사용 목적 구매 시 미화 $150 이하는 면세입니다. 초과 시 물품 종류에 따라 관세(0~13%)와 부가세(10%)가 부과됩니다. 사업자 수입의 경우 관세 + 부가세가 부과되며, 사업자등록증이 필요합니다.',
  },
  {
    category: '통관',
    question: '수입이 불가능한 품목이 있나요?',
    answer:
      '위조품, 마약류, 총기류 등은 수입이 금지됩니다. 식품, 의약품, 화장품, 의료기기 등은 별도 인허가가 필요합니다. 주문 전 수입 가능 여부를 확인해주세요.',
  },
  {
    category: '회원',
    question: '사업자 회원과 개인 회원의 차이점은 무엇인가요?',
    answer:
      '사업자 회원은 세금계산서 발행, 대량 구매 할인, 전담 매니저 배정 등의 혜택을 받으실 수 있습니다. 사업자등록증 제출 후 사업자 회원으로 전환 가능합니다.',
  },
  {
    category: '회원',
    question: '적립금은 어떻게 사용하나요?',
    answer:
      '적립금은 상품 결제 시 현금처럼 사용할 수 있습니다. 최소 사용 금액은 1,000원이며, 결제 금액의 최대 30%까지 사용 가능합니다. 적립금 유효기간은 적립일로부터 1년입니다.',
  },
];

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-outline-variant/20 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-start gap-3 w-full px-5 py-4 text-left hover:bg-surface-container-low transition-colors"
      >
        <span className="text-primary font-heading font-bold text-base mt-0.5 flex-shrink-0">Q</span>
        <span className="flex-1 text-sm font-medium text-on-surface leading-relaxed">
          {item.question}
        </span>
        <span
          className={cn(
            'material-symbols-outlined text-on-surface-variant text-[20px] transition-transform mt-0.5 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        >
          expand_more
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-4 pt-0">
          <div className="flex gap-3 ml-0">
            <span className="text-on-surface-variant font-heading font-bold text-base flex-shrink-0">A</span>
            <p className="text-sm text-on-surface-variant leading-relaxed">{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FaqPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('전체');

  const filteredFaq =
    activeCategory === '전체'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-xl text-on-surface">자주 묻는 질문</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          궁금하신 내용을 빠르게 찾아보세요.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-white px-5 py-3 border-b border-outline-variant/20">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                activeCategory === cat
                  ? 'bg-primary text-white'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="mt-2 bg-white">
        {filteredFaq.length > 0 ? (
          filteredFaq.map((item, i) => <FaqAccordionItem key={i} item={item} />)
        ) : (
          <div className="px-5 py-12 text-center">
            <span className="material-symbols-outlined text-on-surface-variant/30 text-[48px] mb-2">
              search_off
            </span>
            <p className="text-sm text-on-surface-variant">해당 카테고리의 FAQ가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
