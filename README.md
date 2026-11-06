# YiwuGo Korea

> 중국 이우(义乌) 도매시장의 상품을 한국어로 탐색할 수 있게 만든 크로스보더 쇼핑몰 프로토타입

![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma)
![Expo](https://img.shields.io/badge/Expo-50-000020?logo=expo)
![Turborepo](https://img.shields.io/badge/Turborepo-monorepo-EF4444?logo=turborepo&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deploy-000000?logo=vercel)

**상태: 프로토타입 (2026년 4월, 약 4일간 집중 개발 후 중단)**
웹 앱(Next.js)은 이우고 Open Platform API 를 실제로 호출해 상품 검색·상세·상점 정보를 한국어로 보여 줍니다.
주문·결제·회원 등 커머스 백엔드(NestJS)와 모바일 앱(Expo)은 모듈과 화면을 작성했지만, 운영 환경에서 연동·검증하지는 않았습니다.

---

## 무엇을 해결하나

이우 시장 상품 정보는 중국어로만 제공되고, 가격은 위안화, 이미지는 외부 도메인 접근이 막혀 있어 한국 사용자가 그대로 쓰기 어렵습니다.
이 프로젝트는 그 사이를 메우는 계층을 만듭니다.

- 상품명·상점명·SKU·사양을 **서버에서 한국어로 번역한 뒤** 내려줌
- 위안화 가격을 **결제 기준 환율**(매매기준율 + 해외결제 수수료)로 원화 환산
- 카테고리 정보가 없는 원본 상품을 **제목 키워드·시장 구역으로 자동 분류**
- 핫링크가 막힌 상품 이미지를 **서버 프록시**로 제공
- 배송비(항공/해운)·관세/부가세(미화 150달러 기준) 예상 금액 안내

## 아키텍처

```
yiwugo-korea/
├── apps/
│   ├── web/      Next.js 14 (App Router) — 실제 동작하는 부분. Vercel 배포 대상
│   │   ├── app/api/        Route Handler: 상품·상점·카테고리·환율·번역·이미지 프록시·크론
│   │   └── lib/            yiwugo-server.ts (API 클라이언트), translation-service.ts, 용어사전
│   ├── api/      NestJS 10 + Prisma — 주문·결제·회원·쿠폰·정산 등 커머스 백엔드 (미연동)
│   └── mobile/   Expo Router 앱 — 탭 화면 골격
└── packages/
    ├── shared/   공유 타입·상수·유틸
    └── ui/       공유 상태(Zustand)·훅·검증 스키마
```

```
브라우저 ──▶ Next.js 페이지 ──▶ /api/* Route Handler ──▶ 이우고 Open Platform (OAuth client_credentials)
                                     │                    └ fetch + Vercel Data Cache (5분~1시간)
                                     ├──▶ 번역: 메모리 캐시 → 용어사전 → MyMemory API → 용어사전 폴백
                                     ├──▶ 환율: 한국수출입은행 → 공개 환율 API → 고정값
                                     └──▶ /api/img: 이미지 프록시 (허용 도메인만)
```

## 기술적으로 집중한 문제

### 1. 중국어 → 한국어 "깜빡임" 없는 번역
- **문제**: 처음에는 클라이언트가 상품을 받은 뒤 번역 API 를 따로 호출해, 중국어가 먼저 보였다가 한국어로 바뀌었습니다.
- **해결**: 서버에서 응답 전에 번역을 끝내도록 바꿨습니다. 한 응답 안의 텍스트를 중복 제거해 병렬 번역하고, 같은 텍스트에 대한 동시 요청은 Promise 하나로 합칩니다.
  번역은 `메모리 캐시 → 상품 용어사전 → MyMemory API(타임아웃) → 용어사전 폴백` 순서이며, 외부 번역이 실패해도 응답 자체는 실패하지 않습니다.
- **결과**: 클라이언트는 항상 번역된 데이터만 받습니다. (`apps/web/lib/translation-service.ts`, `translation-glossary.ts`)

### 2. 서버리스 실행 시간 제한 안에서 느린 외부 API 다루기
- **문제**: 이우고 API(중국 서버)와 번역 API 가 느려 Vercel Hobby 플랜의 10초 제한을 넘기면서 상품 상세가 500 에러를 냈습니다.
- **해결**: 외부 호출을 `fetch(url, { next: { revalidate } })` 로 바꿔 Vercel Data Cache 를 쓰고(검색 5분, 상세 10분, 카테고리 1시간, 번역 7일),
  배치 번역 전체에 시간 예산을 두어 초과 시 용어사전 결과로 즉시 응답하게 했습니다. 하루 1회 크론(`/api/cron/prefetch-translations`)이 인기 상품 번역을 미리 채웁니다.
- **결과**: 번역 일부가 실패해도 상세 페이지는 원문 + 용어사전 번역으로 응답합니다. (`apps/web/app/api/products/[id]/route.ts`)

### 3. 카테고리 없는 원본 상품 분류
- **문제**: 검색 결과 상품에 카테고리 필드가 없어 카테고리 탐색을 만들 수 없었습니다.
- **해결**: 상품 제목의 중국어 키워드 정규식(오분류가 잦은 품목을 먼저 매칭하도록 순서 조정)으로 1차 분류하고, 실패하면 이우국제상무성 시장 구역 코드로 대분류, 그 외는 "기타"로 둡니다. (`apps/web/app/api/utils.ts`)

### 4. 결제 기준 환율
- 한국수출입은행 매매기준율을 우선 쓰고, 실패하면 공개 환율 API → 고정값 순으로 폴백합니다. 여기에 해외결제 수수료 1.5% 를 더한 값을 "결제 적용 환율"로 분리해 보여 줍니다. 서버 메모리에 5분 캐시합니다. (`apps/web/app/api/exchange-rate/current/route.ts`)

### 5. 외부 API 연동 세부
- 이우고 OAuth 토큰을 만료 60초 전까지 재사용하고, 응답 구조가 엔드포인트마다 달라 상점·상품 응답을 정규화하는 계층을 뒀습니다.
- 이우고 CDN 이 외부 Referer 를 막아 이미지가 깨지는 문제를 서버 프록시(`/api/img`)로 해결했습니다.

## 그 밖에 작성한 것

- **웹 화면**: 홈·카테고리·검색(자동완성)·상품 상세·상점, 장바구니·찜·주문·프로필, 관리자(주문·회원·쿠폰·정산·통계) 등 Next.js 페이지 37개. 무한 스크롤, 뒤로가기 시 목록 상태 복원(sessionStorage), 최근 본 상품.
- **NestJS 백엔드**: 인증(JWT + 카카오·네이버·애플 OAuth), 주문 상태 흐름, 토스페이먼츠·카카오페이 결제, 쿠폰·포인트·리뷰·정산·감사 로그 등 모듈과 Prisma 스키마(모델 30개). 프런트엔드와 실제로 연결해 검증하지는 않았습니다.
- **모바일**: Expo Router 탭 화면과 EAS Build 설정.
- **문서**: `docs/ARCHITECTURE.md`, `docs/BUSINESS_RULES.md`(주문 상태·취소/환불·수수료 규칙), 스토어 배포 가이드.

## 품질 / 테스트

- GitHub Actions CI(`.github/workflows/ci.yml`)에 lint·typecheck·test 단계를 정의해 두었습니다.
- 자동화 테스트 코드는 아직 없습니다 (`*.spec.ts` / `*.test.ts` 0개).

## 실행 방법

```bash
npm install

# 웹만 실행 (이우고 API 자격 증명이 있어야 상품 데이터가 나옵니다)
cp apps/web/.env.example apps/web/.env.local   # 값 채우기
npm run dev --workspace @yiwugo/web             # http://localhost:3000

# 백엔드까지 실행하려면 (PostgreSQL·Redis·Meilisearch)
docker compose up -d
cp apps/api/.env.example apps/api/.env
npm run db:migrate
npm run dev
```

## 설정

| 변수 | 위치 | 설명 |
|------|------|------|
| `YIWUGO_CLIENT_ID` / `YIWUGO_CLIENT_SECRET` | web | 이우고 Open Platform 자격 증명 |
| `KOREA_EXIM_API_KEY` | web | 한국수출입은행 환율 API 키 (선택) |
| `NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY` | web | 토스페이먼츠 결제위젯 클라이언트 키 |
| `CRON_SECRET` | web | 번역 프리페치 크론 보호 (선택) |
| `NEXT_PUBLIC_API_URL` | web | 외부 백엔드 주소. 비우면 `/api` |
| `DATABASE_URL`, `JWT_*`, `TOSS_PAYMENTS_*` 등 | api | `apps/api/.env.example` 참고 |

## 개발 방식

[Claude Code](https://claude.com/claude-code) 와 함께 설계·구현했습니다 (커밋의 `Co-Authored-By` 참고).

> 이 저장소는 개인 학습·포트폴리오용이며, 이우고(yiwugo.com)와 제휴하거나 공식적으로 관련된 서비스가 아닙니다.
