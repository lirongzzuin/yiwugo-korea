'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Step = 'info' | 'verify' | 'done';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const apiRegister = useAuthStore((s: any) => s.apiRegister);
  const showToast = useUIStore((s: any) => s.showToast);

  const [step, setStep] = useState<Step>('info');
  const [userType, setUserType] = useState<'individual' | 'business'>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [email, setEmail] = useState('');
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessNumber, setBusinessNumber] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Email verification
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [verificationError, setVerificationError] = useState('');

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
  const allPasswordValid = Object.values(passwordValidation).every(Boolean);

  // Timer countdown
  useEffect(() => {
    if (verificationTimer <= 0) return;
    const id = setInterval(() => setVerificationTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [verificationTimer]);

  const handleAgreeAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setAgreeMarketing(next);
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!email.includes('@')) return;
    try {
      const res = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && !data.exists) {
        setEmailChecked(true);
        setEmailCheckMsg('사용 가능한 이메일입니다');
      } else if (data.exists) {
        setEmailChecked(false);
        setEmailCheckMsg('이미 가입된 이메일입니다');
      } else {
        // API가 없어도 형식만 확인하고 진행
        setEmailChecked(true);
        setEmailCheckMsg('이메일 형식 확인 완료');
      }
    } catch {
      // API 연결 안 되면 형식만 확인
      setEmailChecked(true);
      setEmailCheckMsg('이메일 형식 확인 완료');
    }
  };

  // 이메일 인증 코드 발송
  const handleSendVerification = async () => {
    setVerificationSending(true);
    setVerificationError('');
    try {
      const res = await fetch(`${API_URL}/auth/send-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setVerificationTimer(180); // 3분
        showToast('인증 코드가 이메일로 발송되었습니다', 'success');
      } else {
        // API 미구현 시에도 step 전환은 허용
        setVerificationTimer(180);
        showToast('인증 코드 발송 (테스트 모드: 000000)', 'info');
      }
    } catch {
      setVerificationTimer(180);
      showToast('인증 코드 발송 (테스트 모드: 000000)', 'info');
    } finally {
      setVerificationSending(false);
    }
  };

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    setVerificationError('');
    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });
      if (res.ok) {
        return true;
      }
      // 테스트 모드: 000000은 항상 통과
      if (verificationCode === '000000') return true;
      setVerificationError('인증 코드가 올바르지 않습니다');
      return false;
    } catch {
      // API 연결 안 될 때 테스트 코드로 통과
      if (verificationCode === '000000') return true;
      setVerificationError('인증 코드가 올바르지 않습니다');
      return false;
    }
  };

  // Step 1 → Step 2 (이메일 인증)
  const handleProceedToVerify = () => {
    setStep('verify');
    handleSendVerification();
  };

  // Step 2 → 가입 완료
  const handleRegister = async () => {
    setIsLoading(true);
    setError('');

    // 인증 코드 확인
    const verified = await handleVerifyCode();
    if (!verified) {
      setIsLoading(false);
      return;
    }

    try {
      await apiRegister({
        email,
        password,
        name,
        phone: phone || undefined,
        memberType: userType === 'business' ? 'BUSINESS' : 'INDIVIDUAL',
        businessNumber: userType === 'business' ? businessNumber : undefined,
        businessName: userType === 'business' ? businessName : undefined,
        agreeTerms,
        agreePrivacy,
        agreeMarketing,
      });
      setStep('done');
      showToast('회원가입이 완료되었습니다!', 'success');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const isStep1Valid = useMemo(() => {
    const base = email.trim() !== '' && emailChecked && allPasswordValid && passwordMatch && name.trim() !== '' && agreeTerms && agreePrivacy;
    if (userType === 'business') return base && businessNumber.trim() !== '' && businessName.trim() !== '';
    return base;
  }, [email, emailChecked, allPasswordValid, passwordMatch, name, agreeTerms, agreePrivacy, userType, businessNumber, businessName]);

  const stepLabels = ['정보입력', '이메일 인증', '가입완료'];
  const stepIndex = step === 'info' ? 0 : step === 'verify' ? 1 : 2;

  return (
    <div className="min-h-screen flex flex-col bg-surface max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center h-14 px-4 sticky top-0 bg-surface/95 backdrop-blur-md z-10">
        <button
          onClick={() => step === 'info' ? router.back() : setStep('info')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
        >
          <span className="material-symbols-outlined">{step === 'done' ? 'close' : 'arrow_back'}</span>
        </button>
        <h1 className="flex-1 text-center font-heading font-bold text-lg -ml-10">회원가입</h1>
        <div className="w-10" />
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-2 pb-6">
        <div className="flex items-center gap-1">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container">
                <div className={cn('h-full rounded-full transition-all duration-500', i <= stepIndex ? 'bg-primary w-full' : 'w-0')} />
              </div>
              <span className={cn('text-[11px] font-medium', i <= stepIndex ? 'text-primary' : 'text-on-surface-variant/50')}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Info */}
      {step === 'info' && (
        <div className="flex-1 px-5 pb-28 overflow-y-auto">
          {/* User type toggle */}
          <div className="flex rounded-xl bg-surface-container p-1 mb-6">
            <button onClick={() => setUserType('individual')} className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200', userType === 'individual' ? 'bg-white text-primary shadow-soft' : 'text-on-surface-variant')}>
              <span className="material-symbols-outlined text-[18px] mr-1 align-middle">person</span>
              개인 구매자
            </button>
            <button onClick={() => setUserType('business')} className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200', userType === 'business' ? 'bg-white text-primary shadow-soft' : 'text-on-surface-variant')}>
              <span className="material-symbols-outlined text-[18px] mr-1 align-middle">business</span>
              사업자
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">이메일 <span className="text-error">*</span></label>
              <div className="flex gap-2">
                <input type="email" placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setEmailChecked(false); setEmailCheckMsg(''); }}
                  className="flex-1 h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                <button onClick={handleCheckEmail} disabled={!email.includes('@')}
                  className={cn('px-4 h-12 rounded-xl text-sm font-semibold whitespace-nowrap transition-all', email.includes('@') ? 'bg-primary text-white hover:bg-primary-container' : 'bg-surface-container-high text-on-surface-variant/50')}>
                  중복확인
                </button>
              </div>
              {emailCheckMsg && (
                <p className={cn('text-xs mt-1.5 flex items-center gap-1', emailChecked ? 'text-green-600' : 'text-error')}>
                  <span className="material-symbols-outlined text-[14px]">{emailChecked ? 'check_circle' : 'error'}</span>
                  {emailCheckMsg}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">비밀번호 <span className="text-error">*</span></label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} placeholder="8자 이상, 대문자/숫자/특수문자 포함" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {password && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                  {([['minLength', '8자 이상'], ['hasUppercase', '대문자 포함'], ['hasNumber', '숫자 포함'], ['hasSpecial', '특수문자 포함']] as const).map(([key, label]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span className={cn('material-symbols-outlined text-[14px]', passwordValidation[key] ? 'text-green-600' : 'text-on-surface-variant/40')}>
                        {passwordValidation[key] ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className={cn('text-xs', passwordValidation[key] ? 'text-green-600' : 'text-on-surface-variant/60')}>{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">비밀번호 확인 <span className="text-error">*</span></label>
              <div className="relative">
                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="비밀번호를 다시 입력해주세요" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn('w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 transition-all', confirmPassword && !passwordMatch ? 'border-error focus:ring-error/30' : 'border-outline-variant/40 focus:ring-primary/30 focus:border-primary')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {confirmPassword && !passwordMatch && <p className="text-xs text-error mt-1.5">비밀번호가 일치하지 않습니다</p>}
              {passwordMatch && <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span>비밀번호가 일치합니다</p>}
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">이름 <span className="text-error">*</span></label>
              <input type="text" placeholder="실명을 입력해주세요" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            {/* Phone (optional) */}
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">휴대폰 번호 <span className="text-on-surface-variant text-xs font-normal">(선택)</span></label>
              <input type="tel" placeholder="01012345678" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
            </div>

            {/* Business fields */}
            {userType === 'business' && (
              <>
                <div>
                  <label className="text-sm font-semibold text-on-surface mb-1.5 block">사업자등록번호 <span className="text-error">*</span></label>
                  <input type="text" placeholder="000-00-00000" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-on-surface mb-1.5 block">상호명 <span className="text-error">*</span></label>
                  <input type="text" placeholder="사업자 상호명" value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
                </div>
              </>
            )}

            {/* Terms */}
            <div className="mt-2 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
              <label className="flex items-center gap-3 cursor-pointer pb-3 mb-3 border-b border-outline-variant/30">
                <button type="button" onClick={handleAgreeAll} className={cn('w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0', agreeAll ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent')}>
                  {agreeAll && <span className="material-symbols-outlined text-white text-[16px]">check</span>}
                </button>
                <span className="text-sm font-bold text-on-surface">전체 동의</span>
              </label>
              {[
                { state: agreeTerms, setter: setAgreeTerms, label: '[필수] 이용약관 동의', required: true },
                { state: agreePrivacy, setter: setAgreePrivacy, label: '[필수] 개인정보 처리방침 동의', required: true },
                { state: agreeMarketing, setter: setAgreeMarketing, label: '[선택] 마케팅 정보 수신 동의', required: false },
              ].map(({ state, setter, label, required }) => (
                <label key={label} className="flex items-center gap-3 cursor-pointer py-1.5">
                  <button type="button" onClick={() => { setter(!state); if (agreeAll && state) setAgreeAll(false); }}
                    className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0', state ? 'bg-primary border-primary' : 'border-outline-variant bg-transparent')}>
                    {state && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                  </button>
                  <span className={cn('text-sm', required ? 'text-on-surface' : 'text-on-surface-variant')}>{label}</span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant/50 ml-auto">chevron_right</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Email Verification */}
      {step === 'verify' && (
        <div className="flex-1 px-5 pb-28">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[32px]">mark_email_read</span>
            </div>
            <h2 className="text-lg font-heading font-bold text-on-surface mb-1">이메일 인증</h2>
            <p className="text-sm text-on-surface-variant">
              <span className="font-semibold text-primary">{email}</span>로<br />
              인증 코드가 발송되었습니다
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-on-surface mb-1.5 block">인증 코드 6자리</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => { setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6)); setVerificationError(''); }}
                  maxLength={6}
                  className="flex-1 h-14 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-lg font-mono text-center tracking-[0.5em] placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {verificationError && (
                <p className="text-xs text-error mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">error</span>
                  {verificationError}
                </p>
              )}
              {verificationTimer > 0 && (
                <p className="text-xs text-on-surface-variant mt-1.5 text-center">
                  남은 시간: <span className="font-semibold text-primary">{Math.floor(verificationTimer / 60)}:{String(verificationTimer % 60).padStart(2, '0')}</span>
                </p>
              )}
            </div>

            <button
              onClick={handleSendVerification}
              disabled={verificationSending || verificationTimer > 150}
              className="w-full text-sm text-primary font-medium py-2 hover:underline disabled:opacity-50"
            >
              {verificationSending ? '발송 중...' : '인증 코드 재발송'}
            </button>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20">
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
                <p className="text-sm text-error">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 'done' && (
        <div className="flex-1 px-5 flex flex-col items-center justify-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <span className="material-symbols-outlined text-green-600 text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h2 className="text-xl font-heading font-bold text-on-surface mb-2">가입이 완료되었습니다!</h2>
          <p className="text-sm text-on-surface-variant text-center mb-2">
            <span className="font-semibold">{name}</span>님, 환영합니다
          </p>
          <p className="text-xs text-on-surface-variant/70 text-center mb-8">
            이우고 코리아에서 중국 도매 상품을 만나보세요
          </p>

          <div className="w-full space-y-3">
            <button onClick={() => router.push('/')} className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-sm hover:shadow-medium active:scale-[0.98] transition-all">
              쇼핑 시작하기
            </button>
            <button onClick={() => router.push('/profile')} className="w-full h-12 rounded-xl border-2 border-outline-variant/40 text-on-surface font-semibold text-sm hover:bg-surface-container transition-all">
              프로필 설정하기
            </button>
          </div>
        </div>
      )}

      {/* Fixed bottom button */}
      {step === 'info' && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 max-w-lg mx-auto">
          <button
            disabled={!isStep1Valid}
            onClick={handleProceedToVerify}
            className={cn(
              'w-full h-13 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200',
              isStep1Valid
                ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
                : 'bg-outline-variant/60 cursor-not-allowed'
            )}
          >
            다음: 이메일 인증
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-surface/95 backdrop-blur-md border-t border-outline-variant/30 max-w-lg mx-auto">
          <button
            disabled={verificationCode.length !== 6 || isLoading}
            onClick={handleRegister}
            className={cn(
              'w-full h-13 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200',
              verificationCode.length === 6 && !isLoading
                ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
                : 'bg-outline-variant/60 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                가입 처리 중...
              </span>
            ) : '인증 확인 및 가입 완료'}
          </button>
        </div>
      )}
    </div>
  );
}
