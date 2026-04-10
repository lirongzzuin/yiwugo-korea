export const shippingStartedTemplate = {
  title: '상품이 발송되었습니다',
  body: (orderNumber: string) =>
    `주문번호 ${orderNumber}의 상품이 중국에서 발송되었습니다. 배송 추적은 주문 상세에서 확인하실 수 있습니다.`,
  kakaoTemplate: 'SHIPPING_STARTED',
};

export const shippingStartedEmail = {
  subject: (orderNumber: string) =>
    `[이우고 코리아] 배송 시작 - ${orderNumber}`,
  html: (orderNumber: string, userName: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Apple SD Gothic Neo', sans-serif;">
      <h2 style="color: #1a1a1a;">상품이 발송되었습니다</h2>
      <p>${userName}님, 안녕하세요.</p>
      <p>주문번호 <strong>${orderNumber}</strong>의 상품이 중국에서 발송되었습니다.</p>
      <p>배송 추적은 주문 상세 페이지에서 확인하실 수 있습니다.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">이우고 코리아 | yiwugo.co.kr</p>
    </div>
  `,
};
