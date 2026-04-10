export const orderConfirmedTemplate = {
  title: '주문이 확인되었습니다',
  body: (orderNumber: string) =>
    `주문번호 ${orderNumber}이(가) 확인되어 처리가 시작됩니다. 진행 상황은 주문 상세에서 확인하실 수 있습니다.`,
  kakaoTemplate: 'ORDER_CONFIRMED',
};

export const orderConfirmedEmail = {
  subject: (orderNumber: string) =>
    `[이우고 코리아] 주문 확인 - ${orderNumber}`,
  html: (orderNumber: string, userName: string) => `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Apple SD Gothic Neo', sans-serif;">
      <h2 style="color: #1a1a1a;">주문이 확인되었습니다</h2>
      <p>${userName}님, 안녕하세요.</p>
      <p>주문번호 <strong>${orderNumber}</strong>이(가) 확인되어 처리가 시작됩니다.</p>
      <p>주문 상세 페이지에서 진행 상황을 확인하실 수 있습니다.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #888; font-size: 12px;">이우고 코리아 | yiwugo.co.kr</p>
    </div>
  `,
};
