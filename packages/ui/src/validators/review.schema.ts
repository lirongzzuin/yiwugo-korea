import { z } from 'zod';

export const reviewSchema = z.object({
  productId: z.string().min(1, '상품 ID가 필요합니다'),
  orderId: z.string().optional(),
  rating: z
    .number({ required_error: '별점을 선택해주세요' })
    .int()
    .min(1, '별점은 1~5점이어야 합니다')
    .max(5, '별점은 1~5점이어야 합니다'),
  content: z
    .string()
    .max(1000, '리뷰는 1000자 이내로 작성해주세요')
    .optional(),
  images: z
    .array(z.string().url('올바른 이미지 URL이 아닙니다'))
    .max(5, '이미지는 최대 5개까지 첨부할 수 있습니다')
    .optional(),
  qualityGood: z.boolean().optional(),
  deliveryGood: z.boolean().optional(),
  transAccurate: z.boolean().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
