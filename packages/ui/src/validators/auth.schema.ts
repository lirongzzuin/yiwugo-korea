import { z } from 'zod';
import { MemberType, AuthProvider } from '@yiwugo/shared';

/** Korean phone number: 010-XXXX-XXXX or 01XXXXXXXXX formats */
const koreanPhoneRegex = /^01[016789]-?\d{3,4}-?\d{4}$/;

/** Password: 8-16 chars, must contain letter + number + special character */
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]).{8,16}$/;

export const loginSchema = z.object({
  email: z
    .string({ required_error: '이메일을 입력해주세요' })
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string({ required_error: '비밀번호를 입력해주세요' })
    .min(8, '비밀번호는 8자 이상이어야 합니다'),
});

export const registerSchema = z
  .object({
    email: z
      .string({ required_error: '이메일을 입력해주세요' })
      .email('올바른 이메일 형식이 아닙니다'),
    password: z
      .string({ required_error: '비밀번호를 입력해주세요' })
      .regex(
        passwordRegex,
        '비밀번호는 8~16자, 영문+숫자+특수문자를 포함해야 합니다',
      ),
    confirmPassword: z
      .string({ required_error: '비밀번호 확인을 입력해주세요' }),
    name: z
      .string({ required_error: '이름을 입력해주세요' })
      .min(2, '이름은 2자 이상이어야 합니다'),
    phone: z
      .string({ required_error: '전화번호를 입력해주세요' })
      .regex(koreanPhoneRegex, '올바른 한국 전화번호를 입력해주세요'),
    memberType: z.nativeEnum(MemberType, {
      required_error: '회원 유형을 선택해주세요',
    }),
    businessNumber: z
      .string()
      .regex(/^\d{3}-\d{2}-\d{5}$/, '올바른 사업자등록번호 형식이 아닙니다 (XXX-XX-XXXXX)')
      .optional(),
    agreeTerms: z
      .literal(true, {
        errorMap: () => ({ message: '이용약관에 동의해주세요' }),
      }),
    agreePrivacy: z
      .literal(true, {
        errorMap: () => ({ message: '개인정보 처리방침에 동의해주세요' }),
      }),
    marketingConsent: z.boolean().optional().default(false),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.memberType === MemberType.BUSINESS) {
        return !!data.businessNumber;
      }
      return true;
    },
    {
      message: '사업자 회원은 사업자등록번호가 필요합니다',
      path: ['businessNumber'],
    },
  );

export const socialLoginSchema = z.object({
  provider: z.nativeEnum(AuthProvider),
  accessToken: z.string().min(1, '액세스 토큰이 필요합니다'),
  idToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  email: z
    .string({ required_error: '이메일을 입력해주세요' })
    .email('올바른 이메일 형식이 아닙니다'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: '현재 비밀번호를 입력해주세요' })
      .min(1, '현재 비밀번호를 입력해주세요'),
    newPassword: z
      .string({ required_error: '새 비밀번호를 입력해주세요' })
      .regex(
        passwordRegex,
        '비밀번호는 8~16자, 영문+숫자+특수문자를 포함해야 합니다',
      ),
    confirmNewPassword: z
      .string({ required_error: '새 비밀번호 확인을 입력해주세요' }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: '새 비밀번호가 일치하지 않습니다',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: '현재 비밀번호와 다른 비밀번호를 입력해주세요',
    path: ['newPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
