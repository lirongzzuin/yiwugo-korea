'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { useUIStore } from '@/stores/ui-store';

const PROVIDER_NAMES: Record<string, string> = {
  kakao: '카카오',
  naver: '네이버',
  apple: 'Apple',
};

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}

function CallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-on-surface-variant">소셜 로그인 처리 중...</p>
      </div>
    </div>
  );
}

function OAuthCallbackContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiSocialLogin = useAuthStore((s) => s.apiSocialLogin);
  const showToast = useUIStore((s) => s.showToast);

  const provider = params.provider as string;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function handleCallback() {
      // 에러 체크
      if (error) {
        setStatus('error');
        setErrorMsg(error === 'access_denied' ? '로그인이 취소되었습니다' : `인증 오류: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMsg('인증 코드를 받지 못했습니다');
        return;
      }

      // state 검증
      const savedState = sessionStorage.getItem('oauth_state');
      if (savedState && state && savedState !== state) {
        setStatus('error');
        setErrorMsg('보안 검증에 실패했습니다. 다시 시도해주세요.');
        return;
      }
      sessionStorage.removeItem('oauth_state');

      try {
        const result = await apiSocialLogin(provider.toUpperCase(), code);
        const providerName = PROVIDER_NAMES[provider] || provider;

        if (result.isNewUser) {
          showToast(`${providerName} 계정으로 가입되었습니다!`, 'success');
        } else {
          showToast(`${providerName}로 로그인되었습니다`, 'success');
        }
        router.replace('/');
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(err.message || '소셜 로그인에 실패했습니다');
      }
    }

    handleCallback();
  }, [code, state, error, provider, apiSocialLogin, router, showToast]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-error text-[32px]">error</span>
          </div>
          <h2 className="text-lg font-heading font-bold text-on-surface mb-2">로그인 실패</h2>
          <p className="text-sm text-on-surface-variant mb-6">{errorMsg}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-container transition-colors"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return <CallbackLoading />;
}
