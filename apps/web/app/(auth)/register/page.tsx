'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

const STEPS = ['정보입력', '본인인증', '가입완료'] as const;

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step] = useState(0);
  const [userType, setUserType] = useState<'individual' | 'business'>('individual');

  // Form fields
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Terms
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const passwordValidation: PasswordValidation = useMemo(() => ({
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
  }), [password]);

  const passwordMatch = password !== '' && confirmPassword !== '' && password === confirmPassword;

  const handleAgreeAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeMarketing(next);
  };

  const handleCheckEmail = () => {
    if (email.includes('@')) {
      setEmailChecked(true);
    }
  };

  const handleSendVerification = () => {
    if (phone.length >= 10) {
      setVerificationSent(true);
    }
  };

  const isFormValid = useMemo(() => {
    return (
      email.trim() !== '' &&
      emailChecked &&
      Object.values(passwordValidation).every(Boolean) &&
      passwordMatch &&
      name.trim() !== '' &&
      phone.trim() !== '' &&
      agreeTerms &&
      agreePrivacy
    );
  }, [email, emailChecked, passwordValidation, passwordMatch, name, phone, agreeTerms, agreePrivacy]);

  return (
    <div className="min-h-screen flex flex-col bg-surface max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center h-14 px-4 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="flex-1 text-center font-heading font-bold text-lg -ml-10">회원가입</h1>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-2 pb-6">
        <div className="flex items-center gap-1">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    i <= step ? 'bg-primary w-full' : 'w-0'
                  )}
                />
              </div>
              <span className={cn(
                'text-[11px] font-medium',
                i <= step ? 'text-primary' : 'text-on-surface-variant/50'
              )}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-28 overflow-y-auto">
        {/* User type toggle */}
        <div className="flex rounded-xl bg-surface-container p-1 mb-6">
          <button
            onClick={() => setUserType('individual')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              userType === 'individual'
                ? 'bg-white text-primary shadow-soft'
                : 'text-on-surface-variant'
            )}
          >
            <span className="material-symbols-outlined text-[18px] mr-1 align-middle">person</span>
            개인 구매자
          </button>
          <button
            onClick={() => setUserType('business')}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200',
              userType === 'business'
                ? 'bg-white text-primary shadow-soft'
                : 'text-on-surface-variant'
            )}
          >
            <span className="material-symbols-outlined text-[18px] mr-1 align-middle">business</span>
            사업자
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              이메일 <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); }}
                className="flex-1 h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                onClick={handleCheckEmail}
                disabled={!email.includes('@')}
                className={cn(
                  'px-4 h-12 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
                  email.includes('@')
                    ? 'bg-primary text-white hover:bg-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant/50'
                )}
              >
                중복확인
              </button>
            </div>
            {emailChecked && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                사용 가능한 이메일입니다
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              비밀번호 <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="8자 이상, 대문자/숫자/특수문자 포함"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {password && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                {[
                  { key: 'minLength' as const, label: '8자 이상' },
                  { key: 'hasUppercase' as const, label: '대문자 포함' },
                  { key: 'hasNumber' as const, label: '숫자 포함' },
                  { key: 'hasSpecial' as const, label: '특수문자 포함' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-1">
                    <span className={cn(
                      'material-symbols-outlined text-[14px]',
                      passwordValidation[key] ? 'text-green-600' : 'text-on-surface-variant/40'
                    )}>
                      {passwordValidation[key] ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className={cn(
                      'text-xs',
                      passwordValidation[key] ? 'text-green-600' : 'text-on-surface-variant/60'
                    )}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              비밀번호 확인 <span className="text-error">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="비밀번호를 다시 입력해주세요"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  'w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 transition-all',
                  confirmPassword && !passwordMatch
                    ? 'border-error focus:ring-error/30 focus:border-error'
                    : 'border-outline-variant/40 focus:ring-primary/30 focus:border-primary'
                )}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showConfirmPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {confirmPassword && !passwordMatch && (
              <p className="text-xs text-error mt-1.5">비밀번호가 일치하지 않습니다</p>
            )}
            {passwordMatch && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                비밀번호가 일치합니다
              </p>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              이름 <span className="text-error">*</span>
            </label>
            <input
              type="text"
              placeholder="실명을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold text-on-surface mb-1.5 block">
              휴대폰 번호 <span className="text-error">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="01012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
              <button
                onClick={handleSendVerification}
                disabled={phone.length < 10}
                className={cn(
                  'px-3 h-12 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
                  phone.length >= 10
                    ? 'bg-primary text-white hover:bg-primary-container'
                    : 'bg-surface-container-high text-on-surface-variant/50'
                )}
              >
                {verificationSent ? '재발송' : '인증번호 발송'}
              </button>
            </div>
            {verificationSent && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="인증번호 6자리"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="flex-1 h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <div className="flex items-center text-sm text-error font-medium px-2">2:58</div>
              </div>
            )}
          </div>

          {/* Business-specific fields */}
          {userType === 'business' && (
            <>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1.5 block">
                  사업자등록번호 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="000-00-00000"
                  className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-on-surface mb-1.5 block">
                  상호명 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="사업자 상호명"
                  className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </>
          )}

          {/* Terms Agreement */}
          <div className="mt-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <label className="flex items-center gap-3 cursor-pointer pb-3 mb-3 border-b border-outline-variant/30">
              <button
                type="button"
                onClick={handleAgreeAll}
                className={cn(
                  'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
                  agreeAll
                    ? 'bg-primary border-primary'
                    : 'border-outline-variant bg-transparent'
                )}
              >
                {agreeAll && (
                  <span className="material-symbols-outlined text-white text-[16px]">check</span>
                )}
              </button>
              <span className="text-sm font-bold text-on-surface">전체 동의</span>
            </label>

            {[
              { state: agreeTerms, setter: setAgreeTerms, label: '[필수] 이용약관 동의', required: true },
              { state: agreePrivacy, setter: setAgreePrivacy, label: '[필수] 개인정보 처리방침 동의', required: true },
              { state: agreeMarketing, setter: setAgreeMarketing, label: '[선택] 마케팅 정보 수신 동의', required: false },
            ].map(({ state, setter, label, required }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setter(!state);
                    if (agreeAll && state) setAgreeAll(false);
                  }}
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0',
                    state
                      ? 'bg-primary border-primary'
                      : 'border-outline-variant bg-transparent'
                  )}
                >
                  {state && (
                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                  )}
                </button>
                <span className={cn(
                  'text-sm',
                  required ? 'text-on-surface' : 'text-on-surface-variant'
                )}>
                  {label}
                </span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 ml-auto">
                  chevron_right
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 max-w-lg mx-auto">
        <button
          disabled={!isFormValid}
          onClick={() => router.push('/')}
          className={cn(
            'w-full h-13 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200',
            isFormValid
              ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
              : 'bg-outline-variant/60 cursor-not-allowed'
          )}
        >
          가입하기
        </button>
      </div>
    </div>
  );
}
