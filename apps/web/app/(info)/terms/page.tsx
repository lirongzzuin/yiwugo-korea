import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 | 이우고 코리아',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-xl text-on-surface">이용약관</h1>
        <p className="text-xs text-on-surface-variant mt-1">시행일: 2026년 1월 1일</p>
      </div>

      <div className="bg-white mt-2 px-5 py-6">
        <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제1조 (목적)</h2>
            <p>
              이 약관은 이우고 코리아(이하 &quot;회사&quot;)가 제공하는 온라인 도매 중개 서비스(이하 &quot;서비스&quot;)의
              이용에 관한 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제2조 (정의)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>&quot;서비스&quot;란 회사가 운영하는 온라인 플랫폼을 통해 중국 이우 시장의 상품을 한국 이용자에게 중개하는 일체의 서비스를 말합니다.</li>
              <li>&quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
              <li>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 지속적으로 이용할 수 있는 자를 말합니다.</li>
              <li>&quot;판매자&quot;란 중국 이우 시장에서 상품을 공급하는 상점 또는 공장을 말합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
              <li>회사는 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있으며, 변경된 약관은 적용일 7일 전부터 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제4조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다.</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>중국 이우 시장 상품 검색 및 정보 제공</li>
              <li>상품 주문 중개 및 결제 서비스</li>
              <li>국제 물류 및 통관 대행 서비스</li>
              <li>상품 검수 및 포장 서비스</li>
              <li>고객 상담 및 분쟁 중재 서비스</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제5조 (이용계약의 체결)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>이용계약은 이용자가 약관의 내용에 동의한 후 회원가입 신청을 하고, 회사가 이를 승인함으로써 체결됩니다.</li>
              <li>회사는 다음 각 호에 해당하는 경우 가입을 거부할 수 있습니다: 실명이 아니거나 타인의 명의를 이용한 경우, 등록 내용에 허위가 있는 경우, 기타 이용 승인이 적절하지 않다고 판단되는 경우.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제6조 (회원의 의무)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>회원은 서비스 이용 시 관련 법령, 이 약관, 서비스 이용안내 등을 준수하여야 합니다.</li>
              <li>회원은 자신의 ID와 비밀번호에 대한 관리 책임이 있습니다.</li>
              <li>회원은 서비스를 이용하여 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용할 수 없습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제7조 (주문 및 결제)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>이용자는 서비스를 통해 상품을 주문하고 결제할 수 있습니다.</li>
              <li>상품 가격은 중국 위안(CNY) 기준이며, 결제 시점의 환율이 적용됩니다.</li>
              <li>결제 완료 후 주문 취소 및 환불은 본 약관의 관련 조항에 따릅니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제8조 (배송 및 통관)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>국제배송 및 통관 과정에서 발생하는 관세, 부가세 등은 이용자 부담입니다.</li>
              <li>이용자는 정확한 개인통관고유부호 및 배송지 정보를 제공할 의무가 있습니다.</li>
              <li>천재지변, 운송사 파업 등 불가항력으로 인한 배송 지연에 대해 회사는 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제9조 (반품 및 환불)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>검수 단계에서 발견된 불량품은 무료로 교환 또는 환불 처리됩니다.</li>
              <li>단순 변심에 의한 반품은 국제배송비 이용자 부담 하에 처리됩니다.</li>
              <li>커스텀/주문제작 상품은 반품 및 환불이 제한됩니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">제10조 (면책조항)</h2>
            <ol className="list-decimal pl-5 space-y-1">
              <li>회사는 중개 플랫폼으로서 판매자가 제공하는 상품의 품질에 대해 직접적인 보증을 하지 않습니다.</li>
              <li>회사는 천재지변, 전쟁, 정부 규제 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">부칙</h2>
            <p>본 약관은 2026년 1월 1일부터 시행합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
