'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

function ToggleSwitch({ checked, onChange, label, description }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        <span className="text-sm font-medium text-on-surface">{label}</span>
        {description && (
          <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
          checked ? 'bg-primary' : 'bg-stone-300'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
            checked && 'translate-x-5'
          )}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [email, setEmail] = useState('hong@example.com');
  const [editingEmail, setEditingEmail] = useState(false);

  const [notifications, setNotifications] = useState({
    orderStatus: true,
    delivery: true,
    promotion: false,
    priceAlert: true,
    newsletter: false,
  });

  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-surface-container-low max-w-3xl mx-auto pb-8">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-outline-variant/20">
        <h1 className="font-heading font-bold text-lg text-on-surface">설정</h1>
      </div>

      {/* Account Section */}
      <section className="bg-white mt-2 px-5 py-5">
        <h2 className="font-heading font-bold text-base text-on-surface mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">person</span>
          계정 정보
        </h2>

        {/* Email */}
        <div className="py-3 border-b border-outline-variant/20">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant">이메일</span>
              {editingEmail ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block mt-1 w-full rounded-lg border border-outline-variant/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              ) : (
                <p className="text-sm font-medium text-on-surface mt-0.5">{email}</p>
              )}
            </div>
            <button
              onClick={() => setEditingEmail(!editingEmail)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {editingEmail ? '저장' : '변경'}
            </button>
          </div>
        </div>

        {/* Password */}
        <div className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-on-surface-variant">비밀번호</span>
              <p className="text-sm font-medium text-on-surface mt-0.5">********</p>
            </div>
            <button className="text-xs text-primary font-semibold hover:underline">
              변경
            </button>
          </div>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="bg-white mt-2 px-5 py-5">
        <h2 className="font-heading font-bold text-base text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">notifications</span>
          알림 설정
        </h2>

        <ToggleSwitch
          checked={notifications.orderStatus}
          onChange={() => toggleNotification('orderStatus')}
          label="주문 상태 알림"
          description="주문 접수, 결제, 배송 상태 변경 시 알림"
        />
        <div className="border-b border-outline-variant/10" />
        <ToggleSwitch
          checked={notifications.delivery}
          onChange={() => toggleNotification('delivery')}
          label="배송/통관 알림"
          description="배송 출발, 통관 진행, 배송 완료 시 알림"
        />
        <div className="border-b border-outline-variant/10" />
        <ToggleSwitch
          checked={notifications.priceAlert}
          onChange={() => toggleNotification('priceAlert')}
          label="가격 변동 알림"
          description="관심상품 가격 변동 시 알림"
        />
        <div className="border-b border-outline-variant/10" />
        <ToggleSwitch
          checked={notifications.promotion}
          onChange={() => toggleNotification('promotion')}
          label="이벤트/프로모션 알림"
          description="할인, 쿠폰 등 이벤트 관련 알림"
        />
        <div className="border-b border-outline-variant/10" />
        <ToggleSwitch
          checked={notifications.newsletter}
          onChange={() => toggleNotification('newsletter')}
          label="뉴스레터"
          description="주간 인기 상품, 시장 트렌드 소식"
        />
      </section>

      {/* Marketing Consent */}
      <section className="bg-white mt-2 px-5 py-5">
        <h2 className="font-heading font-bold text-base text-on-surface mb-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">campaign</span>
          마케팅 수신 동의
        </h2>
        <ToggleSwitch
          checked={marketingConsent}
          onChange={setMarketingConsent}
          label="마케팅 정보 수신 동의"
          description="SMS, 이메일을 통한 마케팅 정보 수신에 동의합니다."
        />
        <p className="text-[11px] text-on-surface-variant/60 mt-1">
          동의를 거부하시더라도 서비스 이용에는 제한이 없습니다.
        </p>
      </section>

      {/* Danger Zone */}
      <section className="bg-white mt-2 px-5 py-5">
        <h2 className="font-heading font-bold text-base text-error mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-error text-[20px]">warning</span>
          계정 삭제
        </h2>
        <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
          계정을 삭제하면 모든 주문 내역, 리뷰, 적립금이 영구적으로 삭제되며 복구할 수 없습니다.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2.5 rounded-xl border border-error/30 text-error text-sm font-semibold hover:bg-error/5 transition-colors"
          >
            계정 삭제 요청
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-error/5 border border-error/20">
            <p className="text-sm font-medium text-error mb-3">
              정말로 계정을 삭제하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors"
              >
                취소
              </button>
              <button className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-semibold hover:bg-error/90 transition-colors">
                삭제 확인
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
