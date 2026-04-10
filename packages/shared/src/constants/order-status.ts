import { OrderStatus } from '../types/order';

/** Valid next statuses for each order status */
export const ORDER_STATUS_FLOW: Map<OrderStatus, OrderStatus[]> = new Map([
  [OrderStatus.PENDING, [OrderStatus.PAID, OrderStatus.CANCELLED]],
  [OrderStatus.PAID, [OrderStatus.ORDERED_TO_YIWUGO, OrderStatus.CANCELLED, OrderStatus.REFUND_REQUESTED]],
  [OrderStatus.ORDERED_TO_YIWUGO, [OrderStatus.YIWUGO_CONFIRMED, OrderStatus.CANCELLED]],
  [OrderStatus.YIWUGO_CONFIRMED, [OrderStatus.PREPARING]],
  [OrderStatus.PREPARING, [OrderStatus.SHIPPING_FROM_CHINA]],
  [OrderStatus.SHIPPING_FROM_CHINA, [OrderStatus.IN_TRANSIT]],
  [OrderStatus.IN_TRANSIT, [OrderStatus.IN_CUSTOMS]],
  [OrderStatus.IN_CUSTOMS, [OrderStatus.CUSTOMS_CLEARED]],
  [OrderStatus.CUSTOMS_CLEARED, [OrderStatus.DOMESTIC_SHIPPING]],
  [OrderStatus.DOMESTIC_SHIPPING, [OrderStatus.DELIVERED]],
  [OrderStatus.DELIVERED, [OrderStatus.PURCHASE_CONFIRMED, OrderStatus.REFUND_REQUESTED]],
  [OrderStatus.PURCHASE_CONFIRMED, []],
  [OrderStatus.CANCELLED, [OrderStatus.REFUNDED]],
  [OrderStatus.REFUND_REQUESTED, [OrderStatus.REFUNDED, OrderStatus.DELIVERED]],
  [OrderStatus.REFUNDED, []],
]);

/** Korean labels for each order status */
export const ORDER_STATUS_LABELS: Map<OrderStatus, string> = new Map([
  [OrderStatus.PENDING, '결제 대기'],
  [OrderStatus.PAID, '결제 완료'],
  [OrderStatus.ORDERED_TO_YIWUGO, '이우고 발주 완료'],
  [OrderStatus.YIWUGO_CONFIRMED, '이우고 확인'],
  [OrderStatus.PREPARING, '상품 준비 중'],
  [OrderStatus.SHIPPING_FROM_CHINA, '중국 내 배송'],
  [OrderStatus.IN_TRANSIT, '국제 운송 중'],
  [OrderStatus.IN_CUSTOMS, '통관 중'],
  [OrderStatus.CUSTOMS_CLEARED, '통관 완료'],
  [OrderStatus.DOMESTIC_SHIPPING, '국내 배송 중'],
  [OrderStatus.DELIVERED, '배송 완료'],
  [OrderStatus.PURCHASE_CONFIRMED, '구매 확정'],
  [OrderStatus.CANCELLED, '주문 취소'],
  [OrderStatus.REFUND_REQUESTED, '환불 요청'],
  [OrderStatus.REFUNDED, '환불 완료'],
]);

/** Korean descriptions for each order status */
export const ORDER_STATUS_DESCRIPTIONS: Map<OrderStatus, string> = new Map([
  [OrderStatus.PENDING, '결제를 진행해 주세요.'],
  [OrderStatus.PAID, '결제가 완료되었습니다. 이우고에 발주를 진행합니다.'],
  [OrderStatus.ORDERED_TO_YIWUGO, '이우고 셀러에게 주문이 접수되었습니다.'],
  [OrderStatus.YIWUGO_CONFIRMED, '이우고 셀러가 주문을 확인했습니다.'],
  [OrderStatus.PREPARING, '상품을 준비하고 있습니다.'],
  [OrderStatus.SHIPPING_FROM_CHINA, '중국 내 물류센터로 배송 중입니다.'],
  [OrderStatus.IN_TRANSIT, '한국으로 국제 운송 중입니다.'],
  [OrderStatus.IN_CUSTOMS, '세관에서 통관 절차를 진행 중입니다.'],
  [OrderStatus.CUSTOMS_CLEARED, '통관이 완료되었습니다. 국내 배송이 시작됩니다.'],
  [OrderStatus.DOMESTIC_SHIPPING, '국내 택배로 배송 중입니다.'],
  [OrderStatus.DELIVERED, '상품이 배송 완료되었습니다. 상품을 확인해 주세요.'],
  [OrderStatus.PURCHASE_CONFIRMED, '구매가 확정되었습니다. 감사합니다.'],
  [OrderStatus.CANCELLED, '주문이 취소되었습니다.'],
  [OrderStatus.REFUND_REQUESTED, '환불 요청이 접수되었습니다.'],
  [OrderStatus.REFUNDED, '환불이 완료되었습니다.'],
]);
