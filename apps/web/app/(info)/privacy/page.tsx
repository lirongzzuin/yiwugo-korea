import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 | 이우고 코리아',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      <div className="bg-white px-5 py-6 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-xl text-on-surface">개인정보처리방침</h1>
        <p className="text-xs text-on-surface-variant mt-1">시행일: 2026년 1월 1일</p>
      </div>

      <div className="bg-white mt-2 px-5 py-6">
        <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed space-y-6">
          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">1. 개인정보의 수집 및 이용 목적</h2>
            <p>이우고 코리아(이하 &quot;회사&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 가입 의사 확인</li>
              <li>서비스 제공: 상품 주문 처리, 결제, 배송, 통관 대행, 고객 상담</li>
              <li>마케팅 및 광고: 이벤트 정보 제공, 맞춤형 서비스 제공 (동의 시)</li>
              <li>서비스 개선: 접속 빈도 분석, 서비스 이용 통계, 신규 서비스 개발</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">2. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>필수 항목: 이름, 이메일, 비밀번호, 휴대폰 번호, 배송지 주소</li>
              <li>통관 관련: 개인통관고유부호, 사업자등록번호 (사업자 회원)</li>
              <li>결제 관련: 결제 수단 정보 (카드번호 등은 결제 대행사에서 관리)</li>
              <li>자동 수집: IP 주소, 쿠키, 접속 로그, 서비스 이용 기록, 기기 정보</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">3. 개인정보의 보유 및 이용 기간</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>회원 탈퇴 시 지체 없이 파기 (단, 법령에 따라 보존이 필요한 경우 예외)</li>
              <li>전자상거래법에 따른 보존: 계약/청약 철회 기록 5년, 대금 결제 기록 5년, 소비자 불만/분쟁 처리 기록 3년</li>
              <li>통신비밀보호법: 접속 로그 기록 3개월</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">4. 개인정보의 제3자 제공</h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              <li>배송/통관을 위해 물류사, 관세사에게 필요한 최소한의 정보를 제공하는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">5. 개인정보의 국외 이전</h2>
            <p>
              서비스 특성상 주문 처리 및 배송을 위해 이용자의 일부 정보(이름, 주소, 연락처)가 중국 현지 물류 파트너에게 전달될 수 있습니다.
              해당 정보는 배송 목적으로만 사용되며, 목적 달성 후 즉시 파기됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">6. 개인정보의 안전성 확보 조치</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>개인정보의 암호화: 비밀번호 및 민감 정보는 암호화하여 저장 및 관리</li>
              <li>해킹 등에 대비한 기술적 대책: SSL/TLS 암호화 통신, 방화벽, 침입 탐지 시스템 운영</li>
              <li>개인정보 접근 제한: 개인정보를 처리하는 직원의 최소화 및 접근 권한 관리</li>
              <li>정기적 자체 감사 실시</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">7. 이용자의 권리와 행사 방법</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있습니다.</li>
              <li>회원 탈퇴를 통해 개인정보 처리 동의를 철회할 수 있습니다.</li>
              <li>개인정보 열람/정정/삭제/처리정지 요청은 고객센터(support@yiwugo.kr)로 접수 가능합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">8. 쿠키(Cookie)의 운용 및 거부</h2>
            <p>
              회사는 이용자에게 개인화된 서비스를 제공하기 위해 쿠키를 사용합니다.
              이용자는 브라우저 설정에서 쿠키 저장을 거부할 수 있으며, 이 경우 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">9. 개인정보 보호책임자</h2>
            <ul className="list-none space-y-1">
              <li>성명: 김보호</li>
              <li>직책: 개인정보 보호책임자 (CPO)</li>
              <li>이메일: privacy@yiwugo.kr</li>
              <li>전화: 02-1234-5678</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-heading font-bold text-on-surface mb-2">10. 고지의 의무</h2>
            <p>
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 내용의 추가, 삭제 및 정정이 있는 경우에는
              변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
