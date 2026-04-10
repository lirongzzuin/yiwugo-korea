# YiwuGo Korea 데모 배포 가이드

## 프로젝트 현황

| 항목 | 수량 |
|------|------|
| 총 파일 수 | 302개 |
| 총 코드 라인 | 54,282줄 |
| 웹 페이지 | 32페이지 |
| API 모듈 | 20+ 모듈 |
| 빌드 상태 | **성공** |

## 무료 배포 방법 (Vercel)

### 사전 준비

1. [GitHub](https://github.com) 계정
2. [Vercel](https://vercel.com) 계정 (GitHub으로 로그인)

### 배포 순서

#### Step 1: GitHub에 코드 올리기

터미널에서 아래 명령어를 순서대로 실행하세요:

```bash
# GitHub CLI 로그인 (처음 한 번만)
gh auth login

# 저장소 생성 + 푸시
cd yiwugo-korea
gh repo create yiwugo-korea --private --source=. --push
```

또는 수동으로:

```bash
# 1. GitHub에서 새 저장소 생성 (yiwugo-korea)
# 2. 아래 명령어 실행
cd yiwugo-korea
git remote add origin https://github.com/YOUR_USERNAME/yiwugo-korea.git
git push -u origin main
```

#### Step 2: Vercel에서 배포

1. https://vercel.com 로그인
2. **"Add New → Project"** 클릭
3. GitHub 저장소 `yiwugo-korea` 선택
4. 아래 설정 적용:

| 설정 | 값 |
|------|------|
| Framework Preset | Next.js |
| Root Directory | `apps/web` |
| Build Command | `npx next build` |
| Install Command | `npm install` |
| Output Directory | `.next` |

5. **Environment Variables** 추가 (선택사항 - 없어도 됨):

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SITE_NAME` | `이우고 코리아` |

6. **"Deploy"** 버튼 클릭

약 2-3분 후 배포 완료! URL이 자동 생성됩니다:
→ `https://yiwugo-korea-xxxxx.vercel.app`

#### Step 3: 커스텀 도메인 연결 (선택)

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 추가 (예: yiwugo-korea.com)
3. DNS 레코드 설정 안내를 따라 진행

### 외부 공유

배포 후 생성된 Vercel URL을 그대로 공유하면 됩니다.
- PC/모바일 모두 반응형으로 작동
- 별도 로그인 없이 모든 화면 확인 가능
- Mock 데이터로 전체 기능 시연 가능

### 확인 가능한 페이지 목록

| 페이지 | URL | 설명 |
|--------|-----|------|
| **메인 홈** | `/` | 배너, 카테고리, 신상품, 인기상품 |
| **검색** | `/search?q=LED` | 검색 결과 + 필터 |
| **카테고리** | `/category/toys` | 카테고리 + 서브카테고리 |
| **상품 상세** | `/product/1` | 이미지, 옵션, 배송안내, 상점정보 |
| **상점 상세** | `/shop/1` | 상점 프로필, 상품 목록 |
| **이미지 검색** | `/image-search` | 이미지 업로드 + 가이드 |
| **장바구니** | `/cart` | 상점별 그룹핑, 수량 조절 |
| **주문/결제** | `/checkout` | 배송지, 결제수단, 쿠폰/적립금 |
| **주문 목록** | `/orders` | 주문 상태별 필터 |
| **주문 상세** | `/orders/1` | 배송 추적 타임라인 |
| **마이페이지** | `/profile` | 프로필, 주문현황, 메뉴 |
| **관심상품** | `/wishlist` | 찜한 상품 목록 |
| **알림센터** | `/notifications` | 주문/가격/공지 알림 |
| **리뷰작성** | `/reviews` | 별점, 사진 업로드 |
| **설정** | `/settings` | 알림, 비밀번호, 계정 |
| **로그인** | `/login` | 소셜로그인 + 이메일 |
| **회원가입** | `/register` | 개인/사업자 + 약관동의 |
| **비밀번호 찾기** | `/forgot-password` | 이메일 인증 |
| **이용가이드** | `/guide` | 주문/배송/통관 안내 |
| **FAQ** | `/faq` | 카테고리별 FAQ |
| **공지사항** | `/notice` | 공지 목록 + 상세 |
| **이용약관** | `/terms` | 전문 |
| **개인정보처리방침** | `/privacy` | 전문 |
| **회사소개** | `/about` | YiwuGo Korea 소개 |
| **관리자 대시보드** | `/admin` | KPI, 매출, 주문 |
| **관리자 주문** | `/admin/orders` | 주문 관리 |
| **관리자 회원** | `/admin/users` | 회원 관리 |
| **관리자 통계** | `/admin/analytics` | 매출/상품/검색어 분석 |
| **관리자 쿠폰** | `/admin/coupons` | 쿠폰 생성/관리 |
| **관리자 정산** | `/admin/settlements` | 정산 내역 |
| **관리자 설정** | `/admin/settings` | 수수료율, 배송비 설정 |

---

## 로컬 실행 방법

```bash
cd yiwugo-korea/apps/web
npm install   # 이미 설치됨
npm run dev   # http://localhost:3000
```

## 기술 스택 요약

- **프론트엔드**: Next.js 14 + TypeScript + Tailwind CSS
- **백엔드**: NestJS + Prisma + PostgreSQL (추후 연동)
- **모바일**: React Native (Expo) 스캐폴드
- **모노레포**: Turborepo
- **배포**: Vercel (무료)
