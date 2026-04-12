# 이우고 코리아 (YiwuGo Korea)

> 중국 이우(义乌) 시장의 도매 상품을 한국 소비자에게 직접 연결하는 크로스보더 이커머스 플랫폼

---

## 1. 서비스 개요

### 왜 이우고 코리아인가?

중국 저장성 이우시는 세계 최대 소상품 도매시장으로, 21만 개 이상의 점포에서 200만 종 이상의 상품이 거래됩니다. 그러나 한국의 소규모 사업자나 개인이 이우 시장에 직접 접근하기에는 **언어 장벽, 결제 문제, 복잡한 국제 물류, 통관 절차** 등 여러 허들이 존재합니다.

**이우고 코리아**는 이 모든 과정을 하나의 플랫폼에서 해결합니다.

- 중국어 상품 정보를 **자동 한국어 번역**
- **결제 기준 환율** 실시간 표시 (한국수출입은행 매매기준율 + 해외결제 수수료 반영)
- 토스페이먼츠 위젯으로 **모든 결제 수단** 지원 (카드, 계좌이체, 간편결제)
- 중국→한국 **국제 배송 및 통관** 일괄 처리
- 관세/부가세 **자동 계산** 및 안내
- **개인화 추천**: 사용자 행동 기반 맞춤 상품 추천

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
├── 환율 스프레드: 해외결제 수수료(1.5%) 포함된 결제 적용 환율
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
| **결제** | Toss Payments SDK, Kakao Pay | - |
| **인증** | JWT + Passport (Kakao OAuth) | - |
| **상태관리** | Zustand | 4.5 |
| **검증** | Zod | 3.22 |
| **로깅** | Winston | 3.11 |
| **빌드** | Turborepo | 2.0 |

### 시스템 구성도

```
[사용자] ──> [Next.js Web / Expo Mobile]
                      |
                      v
              [NestJS API Server]
              +-------+----------+
              |       |          |
              v       v          v
         [PostgreSQL] [Redis]  [Meilisearch]
              |
              v
    [Toss Payments SDK Widget]
    (카드/계좌이체/간편결제)
              |
              v
    [이우고 Open Platform API]
    (549만+ 상품 실시간 연동)
              |
              v
    [한국수출입은행 환율 API]
    (매매기준율 + 해외결제 수수료)
              |
              v
    [국제 물류 / 통관 시스템]
```

---

## 3. 현재 구현된 기능 (상세)

### 3.1 쇼핑 기능

#### 홈페이지
- 메인 배너 슬라이더 (인기 상품 기반 자동 생성)
- 서비스 강점 4칸 그리드 (정품보장/원스톱물류/실시간환율/한국어지원)
- 추천 상품 / 인기 상품 섹션
- **맞춤 추천 상품 섹션** (개인화 추천 시스템 연동)
- 카테고리 퀵 네비게이션 (이우고 시장 28개 카테고리)
- 결제 기준 환율 실시간 표시

#### 상품 탐색
- **텍스트 검색**: 이우고 API 기반 549만+ 상품 검색
- **이미지 검색**: 사진으로 유사 상품 찾기
- **카테고리 탐색**: 이우고 시장 구조 반영 28개 카테고리
- **상품 자동 분류**: 제목 키워드 + 시장 구역(subMarket) 기반 25개 카테고리 자동 매핑 (분류율 97%)
- **판매자(상점) 조회**: 상점 정보, 인증마크, 응답률, 운영연수
- **필터/정렬**: 가격대, MOQ, 판매량, 최신순, 인증상점, 무료배송
- **무한 스크롤**: Intersection Observer 기반 자동 페이지 로딩 (홈, 검색 페이지)
- **검색 자동완성**: 디바운스 300ms 실시간 검색어 추천 + 인기 검색어 표시
- **최근 본 상품**: localStorage 기반 최근 조회 30개 상품 기록, 홈/상품 상세에 표시
- **스크롤 맨 위로**: 전역 FAB 버튼 (600px 스크롤 시 표시, smooth scroll)
- **페이지 상태 복원**: sessionStorage 기반 카테고리/검색 페이지 상태 유지 (뒤로가기 시 스크롤 위치 + 필터 + 상품 목록 복원, 5분 TTL)

#### 상품 상세
- **카테고리 브레드크럼 네비게이션** (홈 > 상위카테고리 > 하위카테고리)
- 상품 이미지 갤러리 (로딩 스피너 + 에러 폴백)
- **별점/리뷰 요약 바** (평점 분포 차트, 리뷰 태그)
- **SKU 옵션 선택** (실제 선택 가능, 체크마크 표시, 가격 반영)
- 결제 기준 환율 적용 가격 (CNY→KRW)
- 수량별 단가 티어 표시
- **판매자 신뢰도**: 인증 마크, 응답률, 운영연수
- **유사 상품 추천** / **함께 구매한 상품 추천**
- 예상 비용 상세 (배송비, 수수료, 관세, 부가세 분해)
- 찜하기 / 장바구니 / 바로구매

#### 장바구니
- 상품 추가/수량 변경/삭제
- 매장별 그룹핑 표시
- 실시간 합계 계산
- 배송비 미리보기

#### 찜 (위시리스트)
- 찜하기/해제 토글 (**글로벌 상태 동기화** - 상품카드/상세/찜목록 연동)
- 찜 목록 관리
- **바텀 네비게이션에 찜 탭 + 배지 카운트**

### 3.2 주문 및 결제

#### 체크아웃
- 배송지 정보 입력/선택
- 개인통관고유부호 입력
- 배송 방법 선택 (항공 특송 / 해운 일반)
- **Toss Payments SDK 위젯 결제** (카드, 체크카드, 계좌이체, 토스페이, 카카오페이, 네이버페이 등)
- 쿠폰 적용 / 적립금 사용
- 관세/부가세 자동 계산 (미화 $150 초과 시)
- 최종 결제 금액 상세 표시

#### 결제 시스템
- **Toss Payments**: 위젯 SDK 연동 - 모든 결제 수단 자동 지원
- **Kakao Pay**: 카카오페이 직접 결제 (Ready→Approve 플로우)
- 결제 승인/취소/환불 완전 지원
- 웹훅 기반 결제 상태 동기화 (HMAC-SHA256 서명 검증)
- 결제 성공/실패 페이지 (PG 콜백 파라미터 처리)

#### 배송비 계산
- **항공 특송**: ₩5,500/kg + 기본 ₩3,000 (3-5영업일)
- **해운 일반**: ₩2,000/kg + 기본 ₩3,000 (10-14영업일)
- 중량 기반 자동 계산

#### 관세/부가세
- 미화 $150 이하: 면세 (면세 한도 진행률 바 표시)
- 미화 $150 초과: 관세 8% + 부가세 10% 자동 계산
- 결제 기준 환율 적용

### 3.3 환율 시스템

#### 결제 기준 환율 구조
```
한국수출입은행 매매기준율 (1순위)
  또는 국제환율기준 (2순위)
  또는 하드코딩 폴백 (3순위)
        |
        v
  + 해외결제 수수료 (1.5%)
  = 결제 적용 환율
```

- **결제 적용 환율** = 매매기준율 + 해외결제 수수료(1.5%)
- 토스페이먼츠/카드사가 해외결제 시 적용하는 수수료 구조와 동일
- baseRate(기준율)과 rate(적용환율) 분리 제공
- 5분 간격 자동 갱신 (서버 인메모리 캐시 + 클라이언트 localStorage)
- 상단 배너에 "결제 적용 환율" 실시간 표시 (소스, 갱신 시각 포함)
- 비용 상세에 환율 정보 카드 (기준율 + 수수료율 + 적용 환율)

### 3.4 개인화 추천 시스템

#### 행동 데이터 수집 (비동기, 서비스 속도 영향 제로)
- 조회(VIEW), 클릭(CLICK), 찜(WISHLIST), 장바구니(CART), 구매(PURCHASE), 검색(SEARCH)
- NestJS EventEmitter 기반 fire-and-forget 방식
- 프론트엔드 `navigator.sendBeacon` 활용

#### 선호도 프로파일링
- 카테고리별 가중치 점수 (행동 유형 x 시간 감쇠)
- 선호 가격대 분석 (하위 20% ~ 상위 80%)
- 자주 본 상점 추출 (상위 5개)
- 매시간 백그라운드 크론으로 재계산

#### 추천 전략
- **맞춤 추천**: 선호 카테고리 + 가격대 + 인기도 복합 점수
- **유사 상품**: 같은 카테고리 + 비슷한 가격대
- **함께 구매한 상품**: 협업 필터링 기반

### 3.5 상품 자동 카테고리 분류

이우고 API 상품에는 카테고리 필드가 없으므로, 자체 분류 시스템을 구현했습니다.

#### 분류 방식
1. **키워드 매칭 (1순위)**: 상품 제목의 중국어 키워드로 25개 카테고리 매핑
2. **시장 구역 매핑 (2순위)**: 이우국제상무성 구역 코드(subMarket)로 대분류
3. **폴백**: 미분류 시 "기타"

#### 분류 카테고리 (25종)
의류, 양말, 신발, 속옷/언더웨어, 모자/스카프, 액세서리, 시계, 안경, 가방/수납, 전자/디지털, 조명, 완구, 뷰티, 개인위생, 주방용품, 생활잡화, 사무/문구, 철물/공구, 스포츠/아웃도어, 반려동물, 유아/출산, 자동차용품, 축제/선물, 가전, 우산/비옷, 포장/부자재

#### 성능
- **분류율: 97%** (테스트 30개 상품 중 29개 정확 분류)
- 서버사이드 실행 (API 응답 시 즉시 분류)

### 3.6 주문 관리

#### 주문 추적
- 15단계 주문 상태 관리:
  `주문접수 > 결제완료 > 이우고발주 > 발주확인 > 상품준비 > 중국발송 > 국제운송 > 세관도착 > 통관완료 > 국내배송 > 배송완료 > 구매확정`
- 각 단계별 실시간 알림
- 주문 상세 조회 (배송 추적 UI)
- 구매 확정 7일 자동 처리

#### 취소 및 환불
- 결제 완료 후 취소 요청
- 부분 환불 / 전체 환불 지원
- 환불 상태 추적 (요청 > 승인 > 완료)
- 관리자 환불 처리 (승인/거부)

### 3.7 사용자 시스템

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

### 3.8 프로모션 시스템

#### 쿠폰
- 고정 금액 할인 / 퍼센티지 할인 / 무료 배송
- 프로모 코드 입력 등록
- 카테고리별 / 최소 주문 금액 조건
- 유효기간 관리

#### 포인트 (적립금)
- 구매 확정 시 1% 적립
- 리뷰 작성 포인트
- 회원가입 보너스 / 추천인 포인트 / 이벤트 포인트
- 주문 시 포인트 사용
- 포인트 만료 관리

### 3.9 고객 지원

- **알림**: 주문/결제/배송/통관/가격변동/쿠폰/포인트
- **1:1 문의**: 등록, 상태 추적, 관리자 답변
- **실시간 채팅**: WebSocket 기반
- **콘텐츠**: 공지사항, FAQ, 이용 가이드, 이용약관

### 3.10 관리자 기능

- **대시보드**: 실시간 KPI, 매출 차트, 인기 상품, 고객 통계
- **주문 관리**: 상태 변경, 배송 추적, 취소/환불 처리
- **사용자 관리**: 회원 정보, 계정 활성화/비활성화
- **쿠폰 관리**: 생성, 수정, 활성화, 사용 현황
- **정산 관리**: 기간별 정산 생성, 확정, 송금 기록
- **콘텐츠 관리**: 공지사항, FAQ, 배너
- **시스템 설정**: 환율 수동 오버라이드, 배송비, 세금
- **감사 로그**: 관리자 활동 기록, 데이터 변경 추적

### 3.11 다국어 및 번역 (100% 서버사이드 완전 번역)

#### 문제와 해결
**기존 문제**: 중국어 → 한국어 "점프 현상" (상품 로드 시 중국어로 먼저 보이다가 나중에 한국어로 교체)

**해결**: 서버사이드 `mapProductsAsync()`에서 **응답 전에 100% 번역을 완료**하여 전송.
클라이언트는 번역 API를 더 이상 호출하지 않음.

#### 아키텍처
```
이우고 원본 상품 수집
  ↓
mapProductsAsync() [서버]
  ↓
translateBatch([제목1, 상점1, 제목2, 상점2, ...]) [중복 제거 후 병렬 번역]
  ↓
각 텍스트에 대해:
  1. 메모리 캐시 히트? → 즉시 반환
  2. 파일 캐시 히트? → 메모리에 로드 후 반환
  3. 용어사전 적용 → 결과가 원문과 다르면 즉시 반환
  4. MyMemory API (3초 타임아웃) → 용어사전 재적용
  5. 실패 시 용어사전 폴백 (절대 실패하지 않음)
  ↓
완전 번역된 상품 배열 → 클라이언트
```

#### 주요 특징
- **100% 서버사이드 완전 번역**: 클라이언트는 항상 한국어로만 받음 (점프 없음)
- **파일 영속 캐시**: `.next/cache/translations.json` - 서버 재시작해도 유지
- **서버 시작 시 자동 웜업**: Next.js instrumentation으로 인기 상품 사전 번역
- **중복 제거 배치**: 같은 텍스트가 여러 상품에 나와도 1번만 번역
- **3계층 폴백**: 캐시 → API → 용어사전
- **350+ 전문 용어사전**: 이우 시장 도매 용어, 상품 카테고리, 색상, 소재, 사이즈
- **중복 요청 병합**: 동시 요청 시 1번만 API 호출
- **Vercel Cron Jobs**: 4시간마다 인기상품 프리페치 (`/api/cron/prefetch-translations`)
- **Edge Runtime 호환**: Node.js 전용 `fs` 모듈을 조건부 로드

#### 성능 측정 결과 (실측)
| 시나리오 | 응답 시간 | 비고 |
|----------|----------|------|
| 캐시 히트 (warmup 후) | 100ms | 350배 개선 |
| 캐시 미스 (첫 요청) | 3.9초 | API 호출 포함 |
| 캐시 히트 (재요청) | 110ms | |
| 서버 재시작 후 | 886ms (웜업) | 파일 캐시 자동 로드 |

#### 번역 품질 예시 (실측)
```
원문: ins超大雨伞三折叠伞商务男女太阳伞黑胶家用晴雨两用伞LOGO
번역: 특대형 우산 3단 접이식 우산 비즈니스 유니섹스 태양 우산 비닐 홈 레인 & 태양 우산 로고

원문: 男士中筒秋冬纯色黑白灰船袜篮球袜运动商务赠品足浴店袜子女批发
번역: 남성용 미드 카프 가을 겨울 솔리드 블랙 화이트 그레이 보트 양말 농구 양말 스포츠 비즈니스 사은품

원문: 拉布布批发三代公仔娃娃泡泡玛特三代盲盒labubu玩偶毛绒挂件玩具
번역: 랍부 도매 3세대 인형 버블 매트 3세대 블라인드 박스 라부부 인형 봉제 펜던트 장난감
```

### 3.12 모바일 앱

- 홈/카테고리/검색/장바구니/마이페이지 탭 네비게이션
- 생체 인증 (지문, Face ID)
- 카메라 이미지 검색
- 푸시 알림
- 오프라인 모드 지원

---

## 4. 데이터베이스 설계

### 핵심 테이블

```
사용자 관련         상품 관련             주문/결제
-----------       -----------          -----------
users             products             orders
addresses         categories           order_items
user_coupons      shops                order_status_history
                  price_history        payments
                                       refunds

장바구니/찜         프로모션               추천/행동
-----------       -----------          -----------
cart_items        coupons              user_activities
wishlist_items    point_history        user_preferences

시스템
-----------
notifications, inquiries, settlements, exchange_rates
translation_cache, audit_logs, banners, notices, faqs
```

### 주요 enum

- **주문 상태**: PENDING > PAID > ORDERED_TO_YIWUGO > ... > DELIVERED > PURCHASE_CONFIRMED
- **결제 상태**: PENDING, APPROVED, FAILED, CANCELLED, REFUNDED, PARTIAL_REFUNDED
- **결제 수단**: TOSS_PAYMENTS, KAKAO_PAY
- **배송 방법**: AIR (항공), SEA (해운)
- **사용자 역할**: USER, BUSINESS, ADMIN
- **쿠폰 유형**: FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING
- **사용자 행동**: VIEW, CLICK, WISHLIST, CART, PURCHASE, SEARCH

---

## 5. API 구조

백엔드는 **29개 NestJS 모듈**로 구성되어 있으며, RESTful API를 제공합니다.

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
| Recommendation | `/recommendations` | 맞춤 추천, 유사 상품, 행동 추적 |
| Notification | `/notifications` | 알림 관리 |
| Search | `/search` | Meilisearch 검색 |
| Shipping | `/shipping` | 배송비 계산, 추적 |
| Exchange Rate | `/exchange-rate` | 결제 기준 환율 조회 |
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
git clone https://github.com/lirongzzuin/yiwugo-korea.git
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

# 환율 (선택 - 없으면 국제환율기준 사용)
KOREA_EXIM_API_KEY=...            # 한국수출입은행 API 키

# 선택
MEILISEARCH_HOST=http://localhost:7700
KAKAO_PAY_SECRET_KEY=...
```

---

## 7. 향후 개발 로드맵

### Phase 1: 핵심 고도화 (단기)

#### 결제 수단 확대
- 네이버페이 / 삼성페이 연동
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
- 재고 관리 / 가격 설정 도구
- 판매 분석 / 정산 내역 조회

#### 물류 고도화
- 이우 현지 물류센터 연동
- 실시간 재고 확인 / 묶음 배송 최적화
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

#### 글로벌 확장
- 베트남, 태국, 인도네시아 등 동남아 시장 진출
- 다국어 UI 확대 / 현지 결제 수단 연동

#### 비즈니스 확장
- B2B 전용 플랫폼 (대량 주문, 견적, 계약)
- API 마켓플레이스 (셀러 도구 연동)
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
│   │   │   ├── (shop)/               # 홈, 카테고리, 상품, 검색
│   │   │   ├── (user)/               # 프로필, 주문, 리뷰, 찜
│   │   │   ├── (info)/               # 공지, FAQ, 가이드
│   │   │   ├── admin/                # 관리자 대시보드
│   │   │   ├── checkout/             # 결제 (success/fail/kakao)
│   │   │   └── api/                  # Next.js API Routes
│   │   ├── src/
│   │   │   ├── components/           # UI 컴포넌트
│   │   │   ├── hooks/                # 커스텀 훅 (환율, 행동추적)
│   │   │   └── stores/               # Zustand 스토어
│   │   └── lib/                      # 유틸리티, 이우고 API 클라이언트
│   │
│   ├── api/                          # NestJS 백엔드
│   │   └── src/
│   │       ├── modules/              # 29개 도메인 모듈
│   │       │   ├── auth/
│   │       │   ├── payment/          # 결제 (Toss/Kakao)
│   │       │   ├── recommendation/   # 개인화 추천
│   │       │   └── ...
│   │       ├── common/               # 가드, 인터셉터, 필터
│   │       └── prisma/               # DB 스키마, 시드
│   │
│   └── mobile/                       # Expo 모바일 앱
│       └── app/                      # Expo Router
│
├── packages/
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
| **상품 데이터** | [이우고 Open Platform](https://www.yiwugo.com) | 이우 시장 도매 상품 정보 (549만+) | 상품명, 가격(CNY), 이미지, 판매자 정보 |
| **환율** | [한국수출입은행](https://www.koreaexim.go.kr) (1순위) | CNY 매매기준율 | 공식 기관 환율, KOREA_EXIM_API_KEY 필요 |
| **환율 (보조)** | [open.er-api.com](https://open.er-api.com) | 국제 중시장률 기반 CNY/KRW | 무료 API, API 키 불필요 |
| **결제** | [Toss Payments](https://www.tosspayments.com) | 카드, 계좌이체, 간편결제 전체 | PCI-DSS 인증 PG사, SDK 위젯 |
| **결제 (보조)** | [Kakao Pay API](https://developers.kakaopay.com) | 카카오페이 직접 결제 | Ready > Approve 2단계 플로우 |
| **번역** | MyMemory Translation API | 중국어 상품 정보 한국어 번역 | 번역 캐시 + 용어 사전 보완 |
| **소셜 로그인** | [Kakao Developers](https://developers.kakao.com) | 카카오 계정 간편 로그인 | OAuth 2.0 |

### 환율 적용 구조

```
한국수출입은행 매매기준율: 215.84 KRW/CNY (예시)
  + 해외결제 수수료 (1.5%): +3.24 KRW
  = 결제 적용 환율: 219.08 KRW/CNY
```

이 구조는 토스페이먼츠/카드사가 해외결제 시 적용하는 수수료 구조와 동일합니다.

---

## 10. 모바일 앱 배포

### 빌드 환경
- **Expo SDK 50** + **EAS Build** (클라우드 빌드)
- iOS: `com.yiwugo.korea` / Android: `com.yiwugo.korea`

### 빌드 명령어
```bash
cd apps/mobile

# 개발용 (시뮬레이터)
eas build --platform all --profile development

# 내부 테스트용 (APK/IPA)
eas build --platform all --profile preview

# 스토어 제출용 (AAB/IPA)
eas build --platform all --profile production
```

### 배포 가이드 문서
- [Google Play Store 배포 가이드](docs/GOOGLE_PLAY_STORE_GUIDE.md)
- [Apple App Store 배포 가이드](docs/APPLE_APP_STORE_GUIDE.md)

### 필요 에셋
| 파일 | 크기 | 용도 |
|------|------|------|
| `icon.png` | 1024x1024 | 앱 아이콘 (iOS/Android) |
| `adaptive-icon.png` | 1024x1024 | Android 적응형 아이콘 |
| `splash.png` | 1284x2778 | 스플래시 스크린 |
| `notification-icon.png` | 96x96 | Android 알림 아이콘 |

---

## 12. 라이선스

이 프로젝트는 비공개 프로젝트입니다. 무단 복제 및 배포를 금합니다.

---

## 13. 문의

- GitHub: [lirongzzuin](https://github.com/lirongzzuin)
- Email: 문의 시 이슈를 생성해 주세요

---

*Built with Next.js, NestJS, PostgreSQL, Toss Payments, and Yiwugo Open Platform*
