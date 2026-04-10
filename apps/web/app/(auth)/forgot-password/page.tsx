'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSendEmail = () => {
    if (email.includes('@')) {
      setEmailSent(true);
    }
  };

  const passwordMatch = newPassword !== '' && confirmPassword !== '' && newPassword === confirmPassword;

  return (
    <div className="min-h-screen flex flex-col bg-surface px-5 py-4 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center h-10 mb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors -ml-2"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      </div>

      {/* Lock icon */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
          <span className="material-symbols-outlined text-primary text-[40px]">lock_reset</span>
        </div>
        <h1 className="font-heading text-xl font-bold text-on-surface text-center mb-2">
          비밀번호 찾기
        </h1>
        <p className="text-sm text-on-surface-variant text-center leading-relaxed">
          가입 시 사용한 이메일을 입력해주세요
        </p>
      </div>

      {/* Email input */}
      <div className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        <button
          onClick={handleSendEmail}
          disabled={!email.includes('@')}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200',
            email.includes('@')
              ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
              : 'bg-outline-variant/60 cursor-not-allowed'
          )}
        >
          인증메일 발송
        </button>

        {emailSent && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 border border-green-200 mt-1">
            <span className="material-symbols-outlined text-green-600 text-[20px]">mail</span>
            <p className="text-xs text-green-700">
              인증 메일이 발송되었습니다. 메일함을 확인해주세요.
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-outline-variant/50" />
        <span className="text-xs text-on-surface-variant font-medium">or</span>
        <div className="flex-1 h-px bg-outline-variant/50" />
      </div>

      {/* Alternative login */}
      <button
        onClick={() => router.push('/login')}
        className="w-full h-12 rounded-xl border-2 border-outline-variant/40 text-on-surface font-semibold text-sm hover:bg-surface-container transition-all active:scale-[0.98]"
      >
        다른 방법으로 로그인
      </button>

      {/* New Password Section (prototype view) */}
      <div className="mt-10 pt-8 border-t border-outline-variant/30">
        <div className="flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-primary text-[24px]">vpn_key</span>
          <h2 className="font-heading text-lg font-bold text-on-surface">새 비밀번호 설정</h2>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="새 비밀번호 (8자 이상)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={cn(
              'w-full h-12 px-4 rounded-xl bg-surface-container border text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 transition-all',
              confirmPassword && !passwordMatch
                ? 'border-error focus:ring-error/30'
                : 'border-outline-variant/40 focus:ring-primary/30 focus:border-primary'
            )}
          />

          {confirmPassword && !passwordMatch && (
            <p className="text-xs text-error">비밀번호가 일치하지 않습니다</p>
          )}

          <button
            disabled={!passwordMatch || newPassword.length < 8}
            className={cn(
              'w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-1',
              passwordMatch && newPassword.length >= 8
                ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
                : 'bg-outline-variant/60 cursor-not-allowed'
            )}
          >
            비밀번호 변경하기
          </button>
        </div>
      </div>
    </div>
  );
}
