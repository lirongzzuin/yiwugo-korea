import { z } from 'zod';
import { ShippingMethod, PaymentProvider } from '@yiwugo/shared';

/** Korean customs personal clearance code: P + 12 digits */
const customsCodeRegex = /^P\d{12}$/;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1, '상품 ID가 필요합니다'),
        quantity: z.number().int().min(1, '수량은 1개 이상이어야 합니다'),
        options: z.record(z.string()).optional(),
      }),
    )
    .min(1, '최소 1개 이상의 상품이 필요합니다'),
  shippingAddressId: z.string().min(1, '배송지를 선택해주세요'),
  customsCode: z
    .string({ required_error: '개인통관고유부호를 입력해주세요' })
    .regex(customsCodeRegex, '올바른 개인통관고유부호 형식이 아닙니다 (P + 12자리 숫자)'),
  shippingMethod: z.nativeEnum(ShippingMethod, {
    required_error: '배송 방법을 선택해주세요',
  }),
  couponId: z.string().optional(),
  pointsToUse: z.number().int().min(0, '포인트는 0 이상이어야 합니다').optional(),
  paymentMethod: z.nativeEnum(PaymentProvider, {
    required_error: '결제 수단을 선택해주세요',
  }),
  deliveryMemo: z.string().max(200, '배송 메모는 200자 이내로 작성해주세요').optional(),
});

export const cancelOrderSchema = z.object({
  orderId: z.string().min(1, '주문 ID가 필요합니다'),
  cancelReason: z
    .string({ required_error: '취소 사유를 입력해주세요' })
    .min(1, '취소 사유를 입력해주세요')
    .max(500, '취소 사유는 500자 이내로 작성해주세요'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
