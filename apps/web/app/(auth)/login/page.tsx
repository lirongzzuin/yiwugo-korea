'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const showToast = useUIStore((s) => s.showToast);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 6자 이상이어야 합니다';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    // Mock login - simulate API call
    setTimeout(() => {
      login({
        id: 'user-1',
        name: '홍길동',
        email: email,
        memberType: 'INDIVIDUAL',
        points: 3200,
      });
      setIsLoading(false);
      showToast('로그인 되었습니다', 'success');
      router.push('/');
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    showToast(`${provider} 로그인은 준비 중입니다`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface px-5 py-4 max-w-lg mx-auto">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="self-start w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
      >
        <span className="material-symbols-outlined text-on-surface">close</span>
      </button>

      {/* Brand identity */}
      <div className="flex flex-col items-center mt-10 mb-10">
        <h1 className="font-heading text-3xl font-extrabold text-primary tracking-tight">
          이우고코리아
        </h1>
        <p className="mt-2 text-on-surface-variant text-sm font-medium">
          중국 도매시장, 한국에서 쉽게
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleSocialLogin('카카오')}
          className="relative flex items-center justify-center w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#FEE500', color: '#191919' }}
        >
          <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C6.48 3 2 6.36 2 10.5c0 2.61 1.74 4.9 4.36 6.24-.14.51-.9 3.31-.93 3.51 0 0-.02.16.08.22.1.06.22.03.22.03.29-.04 3.37-2.21 3.9-2.58.77.11 1.57.18 2.37.18 5.52 0 10-3.36 10-7.5S17.52 3 12 3z"/>
          </svg>
          카카오로 시작하기
        </button>

        <button
          onClick={() => handleSocialLogin('네이버')}
          className="relative flex items-center justify-center w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: '#03C75A' }}
        >
          <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.27 10.35h-1.42V8.5h1.42v1.85zm-5.17 0h1.42V6.12h-1.42v4.23zm-3.85-.57l-.78-1.81-.78 1.81H7.25zm6.12.57h1.42V6.12L12.7 9.3l-.63-1.46V6.12H10.65v4.23h1.42l.63-1.47.63 1.47h1.42zm-7.55 0l.28-.66H8.1l.28.66h1.56L7.85 6.12H6.33L4.25 10.35H5.82z" transform="translate(0,3)"/>
          </svg>
          네이버로 시작하기
        </button>

        <button
          onClick={() => handleSocialLogin('Apple')}
          className="relative flex items-center justify-center w-full h-12 rounded-xl font-semibold text-sm text-white bg-black transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <svg className="absolute left-4 w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Apple로 시작하기
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-outline-variant/50" />
        <span className="text-xs text-on-surface-variant font-medium">또는</span>
        <div className="flex-1 h-px bg-outline-variant/50" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            placeholder="이메일 주소"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={cn(
              'w-full h-12 px-4 rounded-xl bg-surface-container border text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
              errors.email ? 'border-error' : 'border-outline-variant/40'
            )}
          />
          {errors.email && (
            <p className="text-xs text-error mt-1 ml-1">{errors.email}</p>
          )}
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            className={cn(
              'w-full h-12 px-4 pr-12 rounded-xl bg-surface-container border text-on-surface text-sm placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
              errors.password ? 'border-error' : 'border-outline-variant/40'
            )}
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
          {errors.password && (
            <p className="text-xs text-error mt-1 ml-1">{errors.password}</p>
          )}
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <button
            type="button"
            onClick={() => setRememberMe(!rememberMe)}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
              rememberMe
                ? 'bg-primary border-primary'
                : 'border-outline-variant bg-transparent'
            )}
          >
            {rememberMe && (
              <span className="material-symbols-outlined text-white text-[16px]">check</span>
            )}
          </button>
          <span className="text-sm text-on-surface-variant">로그인 상태 유지</span>
        </label>

        {/* Login button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            'w-full h-12 rounded-xl font-semibold text-sm text-white transition-all duration-200 mt-2',
            isFormValid && !isLoading
              ? 'bg-gradient-to-r from-primary to-primary-container hover:shadow-medium active:scale-[0.98]'
              : 'bg-outline-variant/60 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              로그인 중...
            </span>
          ) : (
            '로그인'
          )}
        </button>
      </form>

      {/* Footer links */}
      <div className="flex items-center justify-center gap-1 mt-6 text-sm">
        <Link href="/forgot-password" className="text-on-surface-variant hover:text-primary transition-colors">
          비밀번호 찾기
        </Link>
        <span className="text-outline-variant">|</span>
        <Link href="/register" className="text-on-surface-variant hover:text-primary transition-colors">
          회원가입
        </Link>
      </div>
    </div>
  );
}
