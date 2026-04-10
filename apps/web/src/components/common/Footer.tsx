'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/cn';

export default function Footer() {
  const [isBusinessInfoOpen, setIsBusinessInfoOpen] = useState(false);

  return (
    <footer>
      {/* Mobile Footer */}
      <div className="md:hidden bg-surface-container-high border-t border-outline-variant/40 pb-20">
        <div className="px-4 py-5">
          {/* Legal links for mobile */}
          <div className="flex flex-wrap gap-3 mb-4">
            <Link
              href="/terms"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-xs font-bold text-on-surface hover:text-primary transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/guide"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              이용안내
            </Link>
            <Link
              href="/about"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors"
            >
              회사소개
            </Link>
          </div>

          {/* Customer center */}
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-primary text-[18px]">headset_mic</span>
            <span className="font-heading font-bold text-sm text-primary">1588-0000</span>
            <span className="text-[10px] text-on-surface-variant">평일 09:00 - 18:00</span>
          </div>

          {/* Collapsible business info for mobile */}
          <button
            onClick={() => setIsBusinessInfoOpen(!isBusinessInfoOpen)}
            className="flex items-center justify-between w-full py-2 text-xs text-on-surface-variant"
          >
            <span className="font-semibold">사업자 정보</span>
            <span
              className={cn(
                'material-symbols-outlined text-[16px] transition-transform duration-200',
                isBusinessInfoOpen && 'rotate-180'
              )}
            >
              expand_more
            </span>
          </button>
          {isBusinessInfoOpen && (
            <div className="text-[11px] text-on-surface-variant/80 leading-relaxed space-y-1 pt-2 pb-3 animate-fade-in">
              <p>상호: 이우고코리아 주식회사</p>
              <p>대표자: 홍길동</p>
              <p>사업자등록번호: 123-45-67890</p>
              <p>통신판매업신고: 제2024-서울강남-00000호</p>
              <p>주소: 서울특별시 강남구 테헤란로 123, 4층</p>
              <p>개인정보보호책임자: 김철수 (privacy@yiwugo.kr)</p>
              <p>호스팅 서비스: Amazon Web Services</p>
            </div>
          )}

          {/* Copyright */}
          <p className="text-[10px] text-on-surface-variant/60 mt-3">
            &copy; {new Date().getFullYear()} YiwuGo Korea. All rights reserved.
          </p>
        </div>
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block bg-surface-container-high border-t border-outline-variant/40">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10">
          {/* Top section: Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-heading font-bold text-on-surface mb-4">
                쇼핑 안내
              </h3>
              <ul className="space-y-2.5">
                {['이용 방법', '주문 가이드', '배송 안내', '검수 서비스', 'FAQ'].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="/help"
                        className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-on-surface mb-4">
                고객 지원
              </h3>
              <ul className="space-y-2.5">
                {[
                  '고객센터',
                  '1:1 문의',
                  '반품/교환',
                  '분쟁 해결',
                  '제휴 문의',
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="/help"
                      className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-on-surface mb-4">
                카테고리
              </h3>
              <ul className="space-y-2.5">
                {[
                  '생활/주방',
                  '패션/잡화',
                  '전자/디지털',
                  '뷰티/건강',
                  '문구/완구',
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="/category"
                      className="text-sm text-on-surface-variant hover:text-primary transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold text-on-surface mb-4">
                고객센터
              </h3>
              <p className="text-lg font-heading font-bold text-primary mb-1">
                1588-0000
              </p>
              <p className="text-xs text-on-surface-variant mb-3">
                평일 09:00 - 18:00
                <br />
                점심시간 12:00 - 13:00
                <br />
                주말/공휴일 휴무
              </p>
              <p className="text-xs text-on-surface-variant">
                카카오톡: @yiwugokorea
                <br />
                이메일: support@yiwugo.kr
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-outline-variant/40 pt-6">
            {/* Legal links */}
            <div className="flex flex-wrap gap-4 mb-4">
              <Link
                href="/terms"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="text-xs font-bold text-on-surface hover:text-primary transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/guide"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                이용안내
              </Link>
              <Link
                href="/about"
                className="text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                회사소개
              </Link>
            </div>

            {/* Company info */}
            <div className="text-xs text-on-surface-variant/80 leading-relaxed space-y-1">
              <p>
                상호: 이우고코리아 주식회사 | 대표자: 홍길동 |
                사업자등록번호: 123-45-67890
              </p>
              <p>
                통신판매업신고: 제2024-서울강남-00000호 |
                주소: 서울특별시 강남구 테헤란로 123, 4층
              </p>
              <p>
                개인정보보호책임자: 김철수 (privacy@yiwugo.kr) |
                호스팅 서비스: Amazon Web Services
              </p>
            </div>

            {/* Copyright */}
            <p className="text-xs text-on-surface-variant/60 mt-4">
              &copy; {new Date().getFullYear()} YiwuGo Korea. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
