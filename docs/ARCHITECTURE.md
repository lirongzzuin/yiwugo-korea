# YiwuGo Korea - Architecture

## Monorepo Structure

```
yiwugo-korea/
├── apps/
│   ├── web/                    # Next.js 14 App Router (SSR/SSG)
│   │   ├── app/
│   │   │   ├── (shop)/         # 쇼핑 관련 (홈, 카테고리, 상품, 검색, 이미지검색)
│   │   │   ├── (user)/         # 사용자 관련 (장바구니, 주문, 프로필, 리뷰, 설정)
│   │   │   ├── (auth)/         # 인증 (로그인, 회원가입, 비밀번호 찾기)
│   │   │   ├── (info)/         # 정보 페이지 (가이드, FAQ, 공지, 약관, 소개)
│   │   │   ├── admin/          # 관리자 대시보드
│   │   │   ├── checkout/       # 결제 프로세스
│   │   │   ├── layout.tsx      # 루트 레이아웃 (폰트, 메타데이터)
│   │   │   ├── sitemap.ts      # SEO 사이트맵
│   │   │   └── robots.ts       # 크롤러 규칙
│   │   ├── src/
│   │   │   ├── components/     # UI 컴포넌트
│   │   │   ├── lib/            # 유틸리티 (cn, API 클라이언트)
│   │   │   └── styles/         # 글로벌 CSS
│   │   └── next.config.mjs
│   │
│   └── mobile/                 # Expo React Native (expo-router)
│       ├── app/
│       │   ├── _layout.tsx     # Root Stack Navigator
│       │   └── (tabs)/         # Bottom Tab Navigator (5 tabs)
│       ├── app.json            # Expo 설정
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── shared/                 # 공유 비즈니스 로직
│   │   ├── types/              # TypeScript 타입 정의
│   │   ├── utils/              # 공통 유틸리티 (환율, 가격 계산)
│   │   ├── api/                # API 클라이언트
│   │   └── constants/          # 상수 (카테고리, 배송 상태 등)
│   │
│   └── ui/                     # 공유 UI 컴포넌트
│       ├── web/                # Web 전용 컴포넌트
│       └── native/             # React Native 전용 컴포넌트
│
├── docs/                       # 프로젝트 문서
├── docker-compose.yml          # 로컬 개발 환경
├── turbo.json                  # Turborepo 파이프라인 설정
├── package.json                # 루트 워크스페이스
└── tsconfig.base.json          # 공유 TS 설정
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Web Frontend | Next.js 14 (App Router) | SSR/SSG, SEO, 데스크톱/모바일 웹 |
| Mobile | Expo (React Native) + expo-router | iOS/Android 네이티브 앱 |
| Styling (Web) | Tailwind CSS | 유틸리티 CSS, Material Design 커스텀 테마 |
| Icons | Material Symbols Outlined | 일관된 아이콘 시스템 |
| State | Zustand | 경량 글로벌 상태 관리 |
| HTTP | Axios | API 요청 |
| Monorepo | Turborepo + npm workspaces | 빌드 캐싱, 의존성 관리 |
| Language | TypeScript (strict) | 전체 타입 안전성 |

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#b32008` | 브랜드 컬러, CTA, 강조 |
| Surface | `#fcf9f8` | 배경색 |
| Font (Heading) | Manrope | 제목, 강조 텍스트 |
| Font (Body) | Be Vietnam Pro | 본문, 설명 텍스트 |
| Icons | Material Symbols Outlined | 전체 아이콘 |
| Border Radius | 8px (sm), 12px (md), 16px (lg), 24px (2xl) | 카드, 버튼 |

## Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌──────────────────┐
│   사용자     │────▶│  Web / App  │────▶│   API Server     │
│  (브라우저/  │◀────│  (Next.js / │◀────│   (Next.js API   │
│   모바일)    │     │   Expo)     │     │    Routes)       │
└─────────────┘     └─────────────┘     └──────────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                    ┌─────▼─────┐       ┌─────▼─────┐      ┌─────▼─────┐
                    │  Yiwugo   │       │ 번역 API  │      │  결제     │
                    │  상품 API │       │ (중→한)   │      │ (토스     │
                    │  (이우    │       │           │      │  페이먼츠)│
                    │   시장)   │       │           │      │           │
                    └───────────┘       └───────────┘      └───────────┘
```

### 주문 플로우

```
상품 선택 → 장바구니 → 결제 요청
                          │
                          ▼
                    토스페이먼츠 결제
                          │
                          ▼
                    주문 생성 (DB)
                          │
                          ▼
                    이우 현지 수거
                          │
                          ▼
                    검수 / 합포장
                          │
                          ▼
                    국제 운송 (항공/해상)
                          │
                          ▼
                    한국 통관
                          │
                          ▼
                    국내 배송 (CJ대한통운)
                          │
                          ▼
                    배송 완료
```

## Module Dependency

```
apps/web ──────────┐
                   ├──▶ packages/shared (types, utils, api, constants)
apps/mobile ───────┘
                   ├──▶ packages/ui (components)
                   │
                   └──▶ External
                        ├── Yiwugo API (상품 데이터)
                        ├── Translation API (중한 번역)
                        ├── 토스페이먼츠 (결제)
                        ├── CJ대한통운 API (배송 추적)
                        └── 관세청 API (통관 조회)
```

## Key Design Decisions

### 1. Monorepo (Turborepo)
- Web과 Mobile이 비즈니스 로직(packages/shared)을 공유
- 타입 정의, 환율 계산, 가격 포맷팅 등 중복 코드 제거
- Turborepo의 빌드 캐싱으로 CI/CD 속도 최적화

### 2. Next.js App Router Route Groups
- `(shop)`, `(user)`, `(auth)`, `(info)` 그룹으로 레이아웃 분리
- 각 그룹이 독립적인 레이아웃(Header/Footer/BottomNav) 사용 여부 결정
- URL 구조에 영향 없이 코드 구조 정리

### 3. Material Design Tokens + Tailwind
- Material Design 3의 색상 시스템(surface, on-surface, primary 등) 채용
- Tailwind CSS 커스텀 테마로 구현 → 일관된 디자인 시스템
- 모바일 앱에서도 동일한 색상 토큰 사용

### 4. 서버 컴포넌트 vs 클라이언트 컴포넌트
- 정적 콘텐츠(약관, 개인정보방침, 소개): 서버 컴포넌트 (SEO 최적화)
- 인터랙티브 UI(장바구니, 리뷰 작성, 설정): 클라이언트 컴포넌트
- 상품 목록: 서버에서 초기 데이터 로딩 → 클라이언트에서 무한 스크롤

### 5. Expo Router (Mobile)
- Next.js의 파일 기반 라우팅과 유사한 패턴
- 웹 개발자가 모바일 개발에 빠르게 적응 가능
- Deep linking 자동 지원 (yiwugo:// scheme)
