import { z } from 'zod';

/** Korean phone number: 010-XXXX-XXXX or 01XXXXXXXXX formats */
const koreanPhoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;

/** Korean zip code: 5 digits */
const zipCodeRegex = /^\d{5}$/;

export const addressSchema = z.object({
  name: z
    .string({ required_error: '수령인 이름을 입력해주세요' })
    .min(2, '이름은 2자 이상이어야 합니다'),
  phone: z
    .string({ required_error: '전화번호를 입력해주세요' })
    .regex(koreanPhoneRegex, '올바른 한국 전화번호를 입력해주세요'),
  zipCode: z
    .string({ required_error: '우편번호를 입력해주세요' })
    .regex(zipCodeRegex, '우편번호는 5자리 숫자입니다'),
  address1: z
    .string({ required_error: '주소를 입력해주세요' })
    .min(1, '주소를 입력해주세요'),
  address2: z.string().optional(),
  isDefault: z.boolean().default(false),
  label: z.string().max(20, '라벨은 20자 이내로 작성해주세요').optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
