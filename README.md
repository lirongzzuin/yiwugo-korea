# 이우고 코리아 (YiwuGo Korea)

> 중국 이우(义乌) 시장의 도매 상품을 한국 소비자에게 직접 연결하는 크로스보더 이커머스 플랫폼

---

## 1. 서비스 개요

### 왜 이우고 코리아인가?

중국 저장성 이우시는 세계 최대 소상품 도매시장으로, 21만 개 이상의 점포에서 200만 종 이상의 상품이 거래됩니다. 그러나 한국의 소규모 사업자나 개인이 이우 시장에 직접 접근하기에는 **언어 장벽, 결제 문제, 복잡한 국제 물류, 통관 절차** 등 여러 허들이 존재합니다.

**이우고 코리아**는 이 모든 과정을 하나의 플랫폼에서 해결합니다.

- 중국어 상품 정보를 **자동 한국어 번역**
- **원화(KRW) 기반** 실시간 가격 표시 (CNY→KRW 자동 환산)
- 토스페이먼츠/카카오페이 등 **한국 결제 수단** 지원
- 중국→한국 **국제 배송 및 통관** 일괄 처리
- 관세/부가세 **자동 계산** 및 안내

### 타겟 고객

| 고객군 | 설명 |
|--------|------|
| **소규모 셀러** | 스마트스토어, 쿠팡 마켓플레이스 등에서 판매하는 1인 셀러 |
| **소상공인** | 오프라인 매장에서 중국 도매 상품을 소싱하는 사업자 |
| **개인 소비자** | 저렴한 가격에 해외 직구를 원하는 일반 소비자 |
| **스타트업/중소기업** | 소량 다품종 상품을 빠르게 테스트하고 싶은 기업 |

### 비즈니스 모델

```
수익 구조
├── 거래 수수료: 결제 금액의 5% (기본)
├── 배송비 마진: 물류 파트너 대비 마진
├── 환율 스프레드: CNY→KRW 환산 시 마진
├── 프리미엄 서비스: 빠른 배송, 검수 강화 등 부가 서비스
└── 광고/프로모션: 판매자 상품 노출 광고
```

---

## 2. 기술 아키텍처

### 모노레포 구조 (Turborepo)

```
yiwugo-korea/
├── apps/
│   ├── web/          # Next.js 14 - 고객 웹 애플리케이션
│   ├── api/          # NestJS 10 - 백엔드 REST API
│   └── mobile/       # Expo (React Native) - 모바일 앱
├── packages/
│   ├── shared/       # 공유 타입, 유틸리티, 상수, i18n
│   └── ui/           # 공유 상태관리(Zustand), 훅, 검증 스키마
└── docs/             # 프로젝트 문서
```

### 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| **웹 프론트엔드** | Next.js, React, Tailwind CSS | 14.2, 18, 3.4 |
| **모바일** | Expo, React Native | SDK 50, 0.73 |
| **백엔드** | NestJS, Node.js | 10.3 |
| **데이터베이스** | PostgreSQL + Prisma ORM | 16, 5.10 |
| **검색 엔진** | Meilisearch | 0.37 |
| **캐시/큐** | Redis, BullMQ | - |
| **결제** | Toss Payments, Kakao Pay | - |
| **인증** | JWT + Passport (Kakao OAuth) | - |
| **상태관리** | Zustand | 4.5 |
| **검증** | Zod | 3.22 |
| **로깅** | Winston | 3.11 |
| **빌드** | Turborepo | 2.0 |

### 시스템 구성도

```
[사용자] ──→ [Next.js Web / Expo Mobile]
                      │
                      ▼
              [NestJS API Server]
              ┌───────┼───────────┐
              │       │           │
              ▼       ▼           ▼
         [PostgreSQL] [Redis]  [Meilisearch]
              │
              ▼
    [Toss Payments / Kakao Pay]
              │
              ▼
    [이우고 Open Platform API]
              │
              ▼
    [국제 물류 / 통관 시스템]
```

---

## 3. 현재 구현된 기능 (상세)

### 3.1 쇼핑 기능

#### 홈페이지
- 메인 배너 슬라이더 (프로모션, 이벤트)
- 추천 상품 / 인기 상품 섹션
- 카테고리 퀵 네비게이션
- 실시간 환율 표시

#### 상품 탐색
- **텍스트 검색**: Meilisearch 기반 한국어/중국어 검색
- **이미지 검색**: 사진으로 유사 상품 찾기
- **카테고리 탐색**: 계층형 카테고리 구조
- **판매자(상점) 조회**: 상점 정보, 평점, 상품 목록
- **필터/정렬**: 가격대, 카테고리, 판매량, 최신순

#### 상품 상세
- 상품 이미지 갤러리
- SKU/사양 정보 (중국어 원문 + 한국어 번역)
- 실시간 가격 표시 (CNY→KRW 환산)
- 옵션 선택 (색상, 사이즈 등)
- 리뷰 조회
- 찜하기 / 장바구니 담기
- 판매자 마켓 정보

#### 장바구니
- 상품 추가/수량 변경/삭제
- 매장별 그룹핑 표시
- 실시간 합계 계산
- 배송비 미리보기

#### 찜 (위시리스트)
- 찜하기/해제 토글
- 찜 목록 관리

### 3.2 주문 및 결제

#### 체크아웃
- 배송지 정보 입력/선택
- 개인통관고유부호 입력
- 배송 방법 선택 (항공 특송 / 해운 일반)
- **Toss Payments 위젯 결제** (신용카드, 체크카드, 계좌이체, 토스페이, 카카오페이, 네이버페이 등)
- 쿠폰 적용 / 적립금 사용
- 관세/부가세 자동 계산 (미화 $150 초과 시)
- 최종 결제 금액 상세 표시

#### 결제 시스템
- **Toss Payments**: 카드, 계좌이체, 간편결제 (토스페이 등)
- **Kakao Pay**: 카카오페이 간편결제
- 결제 승인/취소/환불 완전 지원
- 웹훅 기반 결제 상태 동기화
- 결제 실패 시 상세 오류 안내 페이지

#### 배송비 계산
- **항공 특송**: ₩5,500/kg + 기본 ₩3,000 (3-5영업일)
- **해운 일반**: ₩2,000/kg + 기본 ₩3,000 (10-14영업일)
- 중량 기반 자동 계산

#### 관세/부가세
- 미화 $150 이하: 면세
- 미화 $150 초과: 관세 8% + 부가세 10% 자동 계산
- 실시간 환율 적용

### 3.3 주문 관리

#### 주문 추적
- 15단계 주문 상태 관리:
  `주문접수 → 결제완료 → 이우고발주 → 발주확인 → 상품준비 → 중국발송 → 국제운송 → 세관도착 → 통관완료 → 국내배송 → 배송완료 → 구매확정`
- 각 단계별 실시간 알림
- 주문 상세 조회 (배송 추적 UI)
- 구매 확정 7일 자동 처리

#### 취소 및 환불
- 결제 완료 후 취소 요청
- 부분 환불 / 전체 환불 지원
- 환불 상태 추적 (요청→승인→완료)
- 관리자 환불 처리 (승인/거부)

### 3.4 사용자 시스템

#### 인증
- 이메일/비밀번호 회원가입
- 카카오 소셜 로그인
- JWT 기반 토큰 관리 (Access + Refresh)
- 비밀번호 재설정
- 이메일 인증

#### 프로필 관리
- 프로필 조회/수정
- 배송지 주소 관리 (CRUD, 기본 배송지)
- 비밀번호 변경
- 개인통관고유부호 등록
- 마케팅 수신 동의

### 3.5 프로모션 시스템

#### 쿠폰
- 고정 금액 할인 / 퍼센티지 할인 / 무료 배송
- 프로모 코드 입력 등록
- 카테고리별 / 최소 주문 금액 조건
- 유효기간 관리

#### 포인트 (적립금)
- 구매 확정 시 1% 적립
- 리뷰 작성 포인트
- 회원가입 보너스
- 추천인 포인트
- 이벤트 포인트
- 주문 시 포인트 사용
- 포인트 만료 관리

### 3.6 고객 지원

#### 알림
- 주문 상태 변경 알림
- 결제/배송/통관 알림
- 가격 변동 알림
- 쿠폰/포인트/이벤트 알림
- 읽음 처리 관리

#### 고객 문의
- 1:1 문의 등록
- 문의 상태 추적 (접수→처리중→해결→종료)
- 관리자 답변

#### 실시간 채팅
- WebSocket 기반 채팅
- 채팅방 관리
- 메시지 히스토리

#### 콘텐츠
- 공지사항 (목록/상세)
- FAQ
- 이용 가이드
- 이용약관 / 개인정보처리방침

### 3.7 관리자 기능

#### 대시보드
- 실시간 KPI (일/주/월 매출, 주문수, 고객수)
- 매출 추이 차트
- 인기 상품 순위
- 고객 통계 분석

#### 관리 기능
- **주문 관리**: 상태 변경, 배송 추적, 취소/환불 처리
- **사용자 관리**: 회원 정보, 계정 활성화/비활성화
- **쿠폰 관리**: 생성, 수정, 활성화, 사용 현황
- **정산 관리**: 기간별 정산 생성, 확정, 송금 기록
- **콘텐츠 관리**: 공지사항, FAQ, 배너 관리
- **시스템 설정**: 환율 수동 입력, 배송비, 세금 설정
- **감사 로그**: 관리자 활동 기록 및 데이터 변경 추적

### 3.8 다국어 및 번역

- 상품 정보 자동 번역 (중국어→한국어)
- 번역 엔진 지원: Google Translate, Papago, DeepL
- 번역 캐시로 중복 번역 방지
- 배치 번역 지원
- 다국어 지원: 한국어, 중국어, 베트남어

### 3.9 모바일 앱

- 홈/카테고리/검색/장바구니/마이페이지 탭 네비게이션
- 생체 인증 (지문, Face ID)
- 카메라 이미지 검색
- 푸시 알림
- 오프라인 모드 지원

---

## 4. 데이터베이스 설계

### 핵심 테이블

```
사용자 관련         상품 관련           주문/결제
─────────         ─────────         ──────────
users             products          orders
addresses         categories        order_items
user_coupons      shops             order_status_history
                  price_history     payments
                                    refunds

장바구니/찜         프로모션            시스템
──────────        ─────────         ─────────
cart_items        coupons           notifications
wishlist_items    point_history     inquiries
                                    settlements
                                    exchange_rates
                                    translation_cache
                                    audit_logs
                                    banners / notices / faqs
```

### 주요 enum

- **주문 상태**: PENDING → PAID → ORDERED_TO_YIWUGO → ... → DELIVERED → PURCHASE_CONFIRMED
- **결제 상태**: PENDING, APPROVED, FAILED, CANCELLED, REFUNDED, PARTIAL_REFUNDED
- **결제 수단**: TOSS_PAYMENTS, KAKAO_PAY
- **배송 방법**: AIR (항공), SEA (해운)
- **사용자 역할**: USER, BUSINESS, ADMIN
- **쿠폰 유형**: FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING

---

## 5. API 구조

백엔드는 **28개 NestJS 모듈**로 구성되어 있으며, RESTful API를 제공합니다.

| 모듈 | 경로 | 주요 기능 |
|------|------|----------|
| Auth | `/auth` | 회원가입, 로그인, 소셜 로그인, 토큰 관리 |
| User | `/users` | 프로필, 배송지, 비밀번호 |
| Product | `/products` | 검색, 상세, 추천, 인기 |
| Category | `/categories` | 카테고리 트리 |
| Shop | `/shops` | 판매자 상점 정보 |
| Cart | `/cart` | 장바구니 CRUD |
| Wishlist | `/wishlist` | 찜하기 |
| Order | `/orders` | 주문 생성, 조회, 상태 관리 |
| Payment | `/payments` | 결제 시작, 승인, 취소 |
| Refund | `/refunds` | 환불 요청, 처리 |
| Review | `/reviews` | 리뷰 작성, 조회 |
| Coupon | `/coupons` | 쿠폰 관리 |
| Points | `/points` | 포인트 적립, 사용 |
| Notification | `/notifications` | 알림 관리 |
| Search | `/search` | Meilisearch 검색 |
| Shipping | `/shipping` | 배송비 계산, 추적 |
| Exchange Rate | `/exchange-rate` | 환율 조회 |
| Settlement | `/settlements` | 정산 관리 |
| Analytics | `/analytics` | KPI, 매출, 통계 |
| Content | `/banners`, `/notices`, `/faqs` | 콘텐츠 관리 |
| Inquiry | `/inquiries` | 고객 문의 |
| Chat | `/chat` | 실시간 채팅 |
| Translation | `/translate` | 번역 서비스 |
| File | `/files` | 파일 업로드 |
| Audit | `/audit-logs` | 감사 로그 |
| Health | `/health` | 헬스 체크 |
| Webhook | `/webhooks` | PG 웹훅 처리 |

---

## 6. 시작하기 (Quick Start)

### 사전 요구사항

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Meilisearch (선택)

### 설치

```bash
# 저장소 클론
git clone https://github.com/younggyun12/yiwugo-korea.git
cd yiwugo-korea

# 의존성 설치
npm install

# 환경변수 설정
cp apps/api/.env.example apps/api/.env
# .env 파일 편집하여 DB, Redis, 결제 키 등 설정

# 데이터베이스 마이그레이션
cd apps/api && npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 개발 서버

| 서비스 | URL | 설명 |
|--------|-----|------|
| 웹 프론트엔드 | http://localhost:3000 | Next.js 개발 서버 |
| 백엔드 API | http://localhost:4000 | NestJS API 서버 |
| API 문서 | http://localhost:4000/api/docs | Swagger UI |

### 환경변수

```bash
# 필수
DATABASE_URL=postgresql://...     # PostgreSQL 연결
REDIS_URL=redis://localhost:6379  # Redis
JWT_ACCESS_SECRET=...             # JWT 시크릿

# 결제 (Toss Payments 테스트 키)
TOSS_PAYMENTS_CLIENT_KEY=test_ck_your_client_key
TOSS_PAYMENTS_SECRET_KEY=test_sk_your_secret_key

# 선택
MEILISEARCH_HOST=http://localhost:7700
KAKAO_PAY_SECRET_KEY=...
```

---

## 7. 향후 개발 로드맵

### Phase 1: 핵심 고도화 (단기)

#### 개인화 추천 시스템
- 사용자 클릭, 조회, 찜, 구매 이력 기반 행동 데이터 수집
- 카테고리/가격대/판매자 기반 관심사 프로파일링
- 유사 사용자 기반 협업 필터링 추천
- 실시간 추천 상품 노출 (홈, 상품 상세, 검색 결과)
- **비동기 처리로 서비스 속도 영향 제로**

#### 결제 수단 확대
- 네이버페이 연동
- 삼성페이 연동
- 해외 카드 결제 (Visa, Mastercard)
- 분할 결제 (할부)

#### SEO 및 마케팅
- 메타 태그 최적화, sitemap 자동 생성
- Open Graph / Twitter Card
- Google Analytics 4 연동
- 카카오 픽셀 / 네이버 전환 추적

### Phase 2: 성장 기능 (중기)

#### 판매자(셀러) 플랫폼
- 판매자 가입 및 대시보드
- 재고 관리
- 가격 설정 도구
- 판매 분석
- 정산 내역 조회

#### 물류 고도화
- 이우 현지 물류센터 연동
- 실시간 재고 확인
- 묶음 배송 최적화
- 배송 추적 API 실시간 연동 (CJ대한통운, 한진 등)
- 반품/교환 물류 프로세스

#### 소셜 기능
- 상품 공유 (카카오톡, SNS)
- 공동 구매 그룹
- 인플루언서 제휴 프로그램
- 사용자 리뷰 사진/동영상 업로드

### Phase 3: 확장 (장기)

#### AI 기능
- AI 기반 상품 번역 품질 향상 (GPT 연동)
- 이미지 검색 고도화 (자체 모델)
- 챗봇 고객 상담
- 수요 예측 및 재고 최적화
- 가격 최적화 알고리즘

#### 글로벌 확장
- 베트남, 태국, 인도네시아 등 동남아 시장 진출
- 다국어 UI 확대
- 현지 결제 수단 연동
- 현지 물류 파트너십

#### 비즈니스 확장
- B2B 전용 플랫폼 (대량 주문, 견적, 계약)
- API 마켓플레이스 (셀러 도구 연동)
- 클라우드 펀딩 / 공동 구매 플랫폼
- 구독 서비스 (정기 배송)
- 금융 서비스 (소상공인 대출, 외환 서비스)

---

## 8. 프로젝트 구조 상세

```
yiwugo-korea/
├── apps/
│   ├── web/                          # Next.js 웹 앱
│   │   ├── app/
│   │   │   ├── (auth)/               # 로그인, 회원가입
���   │   │   ├── (shop)/               # 홈, 카테고리, 상품, 검색
│   │   │   ├── (user)/               # 프로필, 주문, 리뷰
│   │   │   ├── (info)/               # 공지, FAQ, 가이드
│   │   │   ├── admin/                # 관리자 대시보드
│   │   │   ├── checkout/             # 결제 (success/fail 포함)
│   │   │   └── api/                  # Next.js API Routes
│   │   ├── src/components/           # UI 컴포넌트
│   │   └── lib/                      # 유틸리티
│   │
│   ├── api/                          # NestJS 백엔드
│   │   └── src/
│   │       ├── modules/              # 28개 도메인 모듈
│   │       │   ├── auth/
│   │       │   ├── user/
│   │       │   ���── product/
│   │       │   ├── order/
│   │       │   ├── payment/
│   │       │   ├── cart/
���   │       │   ├── wishlist/
│   │       │   ├── review/
│   │       │   ├── coupon/
│   │       │   ├── shipping/
│   │       │   ├── notification/
│   │       │   ├── recommendation/   # 개인화 추천
│   │       │   └── ...
│   │       ├── common/               # 가드, 인터셉터, 필터
│   │       └── prisma/               # DB 스키마, 시드
│   │
│   └── mobile/                       # Expo 모바일 앱
│       └── app/                      # Expo Router
│
├─�� packages/
│   ├── shared/                       # 타입, 유틸, 상수, i18n
│   └── ui/                           # Zustand 스토어, 훅, 검증
│
├── turbo.json                        # Turborepo 설정
├── package.json                      # 루트 package.json
└── README.md
```

---

## 9. 외부 데이터 출처 및 API

| 데이터 | 출처 | 용도 | 비고 |
|--------|------|------|------|
| **상품 데이터** | [이우고 (Yiwugo) Open Platform](https://www.yiwugo.com) | 이우 시장 도매 상품 정보 | 상품명, 가격(CNY), 이미지, 판매자 정보 |
| **환율 (CNY→KRW)** | [한국수출입은행 API](https://www.koreaexim.go.kr) (주), [ExchangeRate-API](https://www.exchangerate-api.com) / [open.er-api.com](https://open.er-api.com) (보조) | 중국 위안→한국 원 실시간 환율 변환 | 5분 간격 자동 갱신, Redis 캐시, 수동 오버라이드 가능 |
| **결제** | [Toss Payments](https://www.tosspayments.com) | 카드, 계좌이체, 간편결제(토스페이, 카카오페이, 네이버페이 등) | PCI-DSS 인증 PG사 |
| **결제 (보조)** | [Kakao Pay API](https://developers.kakaopay.com) | 카카오페이 직접 결제 | Ready→Approve 2단계 플로우 |
| **번역** | Google Translate / Naver Papago / DeepL | 중국어 상품 정보 한국어 번역 | 번역 캐시로 중복 번역 방지 |
| **검색** | [Meilisearch](https://www.meilisearch.com) (자체 호스팅) | 상품 전문 검색 | 한국어/중국어 검색 지원 |
| **지도/주소** | 카카오 주소 검색 API | 배송지 주소 입력 | - |
| **소셜 로그인** | [Kakao Developers](https://developers.kakao.com) | 카카오 계정 간편 로그인 | OAuth 2.0 |

### 환율 시스템 상세

환율 데이터는 다단계 폴백 구조로 안정성을 보장합니다:

```
1순위: 한국수출입은행 API (공식 기관 환율, KOREA_EXIM_API_KEY 필요)
  ↓ 실패 시
2순위: ExchangeRate-API.com (무료 공개 API)
  ↓ 실패 시
3순위: open.er-api.com (무료 공개 API, 프론트엔드)
  ↓ 실패 시
4순위: DB 최근 기록 (PostgreSQL exchange_rates 테이블)
  ↓ 실패 시
5순위: 하드코딩 기본값 (190 KRW/CNY)
```

- **갱신 주기**: 백엔드 5분 간격 크론 스케줄러 + 프론트엔드 5분 간격 폴링
- **캐시**: Redis (5분 TTL) + 브라우저 localStorage
- **관리자**: 수동 환율 오버라이드 가능 (관리자 API)
- **알림**: 환율 1% 이상 급변 시 관리자 알림

---

## 10. 라이선스

이 프로젝트는 비공개 프로젝트입니다. 무단 복제 및 배포를 금합니다.

---

## 11. 문의

- GitHub: [younggyun12](https://github.com/younggyun12)
- Email: 문의 시 이슈를 생성해 주세요

---

*Built with Next.js, NestJS, PostgreSQL, and Toss Payments*
