import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '회사 소개 | 이우고 코리아',
  description: 'YiwuGo Korea - 중국 이우 시장 도매 구매 대행 플랫폼',
};

const FEATURES = [
  {
    icon: 'translate',
    title: '완벽한 한국어 지원',
    description: '상품명, 상세정보, 고객 상담까지 모두 한국어로 이용하세요. AI 번역과 전문 통역사가 언어 장벽을 해소합니다.',
  },
  {
    icon: 'verified',
    title: '전문 검수 서비스',
    description: '이우 현지 검수센터에서 상품 수량, 품질, 규격을 꼼꼼히 확인합니다. 불량품은 출고 전에 교환 처리합니다.',
  },
  {
    icon: 'local_shipping',
    title: '원스톱 물류',
    description: '현지 수거부터 합포장, 국제운송, 통관, 국내배송까지 전 과정을 한 번에 처리합니다.',
  },
  {
    icon: 'currency_exchange',
    title: '실시간 환율 적용',
    description: '투명한 실시간 환율로 정확한 가격을 확인하세요. 숨겨진 수수료 없이 합리적인 가격을 제공합니다.',
  },
  {
    icon: 'shield',
    title: '안전 결제',
    description: '토스페이먼츠 기반의 안전한 결제 시스템. 에스크로 방식으로 상품 수령 전까지 대금을 안전하게 보호합니다.',
  },
  {
    icon: 'support_agent',
    title: '전담 고객 지원',
    description: '주문부터 수령까지 전 과정에서 전담 매니저가 지원합니다. 통관 이슈도 신속하게 해결합니다.',
  },
];

const STATS = [
  { value: '200만+', label: '등록 상품수' },
  { value: '50,000+', label: '이우 상점 수' },
  { value: '15,000+', label: '한국 이용자' },
  { value: '99.2%', label: '배송 완료율' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-4xl mx-auto pb-8">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-container text-white px-5 py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="font-heading font-black text-2xl md:text-4xl mb-3">
            이우고 코리아
          </h1>
          <p className="text-base md:text-lg text-white/90 leading-relaxed">
            중국 최대 도매 시장, 이우를<br className="md:hidden" />
            한국에서 가장 쉽고 안전하게
          </p>
        </div>
      </section>

      {/* About Yiwu */}
      <section className="bg-white mt-2 px-5 py-8">
        <h2 className="font-heading font-bold text-lg text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">location_on</span>
          이우 시장이란?
        </h2>
        <div className="space-y-3 text-sm text-on-surface-variant leading-relaxed">
          <p>
            중국 저장성에 위치한 이우(义乌, Yiwu)는 세계 최대의 소상품 도매 시장입니다.
            축구장 800개 규모의 시장에 7만 5천여 개의 부스가 운영되며,
            생활용품, 전자제품, 패션, 문구, 장난감 등 180만 종 이상의 상품이 거래됩니다.
          </p>
          <p>
            전 세계 200여 개 국가의 바이어들이 이우를 방문하며,
            연간 거래액은 4,000억 위안(약 75조 원)에 달합니다.
            한국의 많은 온라인 셀러, 오프라인 소매상, 무역업체들이 이우에서 상품을 소싱합니다.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white mt-2 px-5 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-2xl bg-primary/5">
              <p className="font-heading font-black text-2xl text-primary">{stat.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Service Features */}
      <section className="bg-white mt-2 px-5 py-8">
        <h2 className="font-heading font-bold text-lg text-on-surface mb-6 text-center">
          이우고 코리아만의 차별화된 서비스
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">{feature.icon}</span>
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-on-surface mb-1">{feature.title}</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Company Info */}
      <section className="bg-white mt-2 px-5 py-8">
        <h2 className="font-heading font-bold text-lg text-on-surface mb-4">회사 정보</h2>
        <div className="text-sm text-on-surface-variant space-y-2">
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">회사명</span>
            <span>이우고 코리아 주식회사</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">대표</span>
            <span>홍길동</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">사업자등록번호</span>
            <span>123-45-67890</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">통신판매업</span>
            <span>제2026-서울강남-XXXXX호</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">주소</span>
            <span>서울특별시 강남구 테헤란로 123, 12층</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">이메일</span>
            <span>support@yiwugo.kr</span>
          </div>
          <div className="flex gap-3">
            <span className="text-on-surface font-medium w-24 flex-shrink-0">고객센터</span>
            <span>02-1234-5678 (평일 09:00~18:00)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
