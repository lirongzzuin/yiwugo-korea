'use client';

import { useState } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { cn } from '@/lib/cn';

interface SettingField {
  key: string;
  label: string;
  description: string;
  type: 'number' | 'toggle';
  unit?: string;
  defaultValue: number | boolean;
}

const settingFields: SettingField[] = [
  { key: 'commissionRate', label: '수수료율', description: '주문 금액에 적용되는 플랫폼 수수료 비율입니다.', type: 'number', unit: '%', defaultValue: 8 },
  { key: 'exchangeMargin', label: '환율 마진', description: '실시간 환율에 추가되는 마진율입니다.', type: 'number', unit: '%', defaultValue: 1.5 },
  { key: 'pointsEarnRate', label: '적립률', description: '결제 금액 대비 적립금 지급 비율입니다.', type: 'number', unit: '%', defaultValue: 1 },
  { key: 'maxPointsUsage', label: '적립금 최대 사용률', description: '주문 시 적립금으로 결제할 수 있는 최대 비율입니다.', type: 'number', unit: '%', defaultValue: 30 },
  { key: 'airShippingRate', label: '항공 배송비 단가', description: '항공 배송 시 kg당 적용되는 단가입니다.', type: 'number', unit: '원/kg', defaultValue: 8500 },
  { key: 'seaShippingRate', label: '해운 배송비 단가', description: '해운 배송 시 kg당 적용되는 단가입니다.', type: 'number', unit: '원/kg', defaultValue: 3200 },
  { key: 'defaultShippingFee', label: '기본 배송료', description: '국내 배송에 적용되는 기본 배송료입니다.', type: 'number', unit: '원', defaultValue: 3000 },
  { key: 'escrowEnabled', label: '에스크로 사용 여부', description: '에스크로 결제를 활성화합니다. 구매자 보호를 위해 권장됩니다.', type: 'toggle', defaultValue: true },
  { key: 'autoConfirmDays', label: '자동 구매확정 기간', description: '배송 완료 후 자동으로 구매확정 처리되는 기간입니다.', type: 'number', unit: '일', defaultValue: 14 },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, number | boolean>>(() =>
    Object.fromEntries(settingFields.map((f) => [f.key, f.defaultValue]))
  );
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: number | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="시스템 설정"
        description="플랫폼 운영에 필요한 시스템 설정을 관리합니다."
      />

      <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/30 overflow-hidden">
        <div className="divide-y divide-outline-variant/20">
          {settingFields.map((field) => (
            <div key={field.key} className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex-1 min-w-0">
                <label className="text-sm font-semibold text-on-surface">{field.label}</label>
                <p className="text-xs text-on-surface-variant mt-0.5">{field.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {field.type === 'number' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={values[field.key] as number}
                      onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-2 text-sm text-right border border-outline-variant/40 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                      step={field.unit === '%' ? 0.1 : 100}
                    />
                    {field.unit && (
                      <span className="text-sm text-on-surface-variant whitespace-nowrap">{field.unit}</span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleChange(field.key, !values[field.key])}
                    className={cn(
                      'relative w-12 h-7 rounded-full transition-colors duration-200',
                      values[field.key] ? 'bg-primary' : 'bg-outline-variant/50'
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
                        values[field.key] ? 'translate-x-6' : 'translate-x-1'
                      )}
                    />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between">
          <div>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-700 text-sm font-medium animate-fade-in">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                설정이 저장되었습니다.
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-container transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
