# Apple App Store 배포 가이드

이우고 코리아 iOS 앱을 Apple App Store에 배포하는 전체 과정을 안내합니다.

---

## 사전 준비

### 1. 필수 계정
- **Apple Developer Program** ($99/년)
  - https://developer.apple.com/programs 에서 등록
  - 개인 또는 조직으로 등록 가능
  - 조직 등록 시 D-U-N-S 번호 필요 (무료 발급, 1-2주 소요)
  - 등록 승인까지 최대 48시간

### 2. 필수 도구
```bash
# EAS CLI 설치
npm install -g eas-cli

# Expo 로그인
eas login

# Apple Developer 자격 증명은 빌드 시 자동 프롬프트
```

### 3. 필수 에셋
- `apps/mobile/assets/icon.png` (1024x1024, 알파 채널 없음)
- `apps/mobile/assets/splash.png` (1284x2778)
- App Store 스크린샷 (기기별):
  - iPhone 6.7" (1290x2796) - 필수
  - iPhone 6.5" (1284x2778) - 필수
  - iPad 12.9" (2048x2732) - iPad 지원 시 필수

---

## Step 1: EAS 프로젝트 초기화

```bash
cd apps/mobile

# EAS 프로젝트 연결 (최초 1회)
eas init

# Apple Developer 계정 연결 확인
eas credentials --platform ios
```

## Step 2: iOS 프로덕션 빌드

```bash
# IPA 빌드 - App Store 제출용
eas build --platform ios --profile production
```

빌드 시 Apple Developer 계정 로그인 요청됩니다.
- Apple ID + App-Specific Password 또는 2FA 필요
- Distribution Certificate + Provisioning Profile 자동 생성

빌드 완료까지 약 15-30분 소요됩니다.

## Step 3: App Store Connect에서 앱 생성

1. https://appstoreconnect.apple.com 접속
2. **"내 앱"** → **"+"** → **"신규 앱"**
3. 앱 정보 입력:

| 항목 | 내용 |
|------|------|
| **플랫폼** | iOS |
| **이름** | 이우고 코리아 - 중국 도매 직구 |
| **기본 언어** | 한국어 |
| **번들 ID** | com.yiwugo.korea |
| **SKU** | yiwugo-korea-ios |
| **사용자 액세스** | 전체 액세스 |

## Step 4: 앱 정보 작성

### 일반 정보
| 항목 | 내용 |
|------|------|
| **부제** | 중국 이우 시장 도매 직구 플랫폼 |
| **카테고리** | 쇼핑 |
| **보조 카테고리** | 비즈니스 |
| **콘텐츠 등급** | 4+ |

### 설명
```
중국 최대 도매시장 이우(义乌)의 200만개 상품을 
한국에서 직접 구매하세요!

이우고 코리아는 중국 이우 국제상무성의 도매 상품을
한국 소비자에게 직접 연결하는 크로스보더 이커머스 플랫폼입니다.

주요 기능:
• 549만+ 상품 실시간 검색 (한국어/중국어)
• 결제 기준 환율 실시간 적용 (한국수출입은행 기준)
• 토스페이먼츠 통합 결제 (카드, 계좌이체, 간편결제)
• 원스톱 물류 (이우 검수 → 합포장 → 한국 통관 → 국내배송)
• 관세/부가세 자동 계산
• AI 맞춤 상품 추천
• 카카오/네이버/Apple 소셜 로그인
• Face ID / Touch ID 생체 인증
```

### 키워드 (100자 이내, 쉼표 구분)
```
이우,도매,중국,직구,소싱,수입,yiwu,wholesale,이우시장,도매시장
```

### 지원 URL
```
https://yiwugo.kr/guide
```

### 개인정보처리방침 URL
```
https://yiwugo.kr/privacy
```

## Step 5: 스크린샷 업로드

### 필수 스크린샷 (기기별)

**iPhone 6.7" Display (1290 x 2796)**
1. 홈 화면 (배너 + 카테고리)
2. 상품 검색 결과
3. 상품 상세 페이지
4. 결제 화면
5. 주문 추적

**iPhone 6.5" Display (1284 x 2778)**
- 위와 동일하게 준비

**iPad 12.9" (선택사항)**
- 태블릿 UI가 지원되는 경우에만

### 스크린샷 촬영 방법
```bash
# Xcode Simulator에서 촬영
# Cmd + S → 자동 저장

# 또는 실기기에서 촬영
# 전원 + 볼륨 업 동시 누르기
```

## Step 6: 앱 심사 정보

### 로그인 정보 (심사용)
Apple 심사팀이 앱을 테스트할 수 있도록 데모 계정 제공:
```
이메일: reviewer@yiwugo.kr
비밀번호: ReviewTest2026!
```

### 심사 메모
```
이 앱은 중국 이우 시장의 도매 상품을 한국 소비자에게
연결하는 이커머스 플랫폼입니다.

결제: 토스페이먼츠 SDK를 사용하며, 테스트 모드로 설정되어
있어 실제 결제가 이루어지지 않습니다.

소셜 로그인: 카카오, 네이버, Apple 로그인을 지원합니다.
Apple 로그인은 필수로 포함되어 있습니다.
```

### App Review 거절 주요 사유 및 대응

| 사유 | 대응 |
|------|------|
| **4.0 Design - Login** | Apple 로그인 필수 포함 (이미 구현됨) |
| **2.1 Performance - Incomplete** | 데모 계정 제공, 모든 기능 동작 확인 |
| **5.1.1 Data Collection** | 개인정보처리방침 URL 등록 |
| **3.1.1 In-App Purchase** | 실물 상품 판매 → IAP 면제 (물리적 상품) |
| **2.3 Accurate Metadata** | 스크린샷이 실제 앱과 일치하도록 |

## Step 7: IPA 업로드

### 방법 1: EAS Submit (자동)
```bash
eas submit --platform ios --profile production
```

### 방법 2: Transporter (수동)
1. Mac App Store에서 **Transporter** 앱 다운로드
2. EAS에서 빌드한 `.ipa` 파일 다운로드
3. Transporter에 `.ipa` 드래그 → **"전송"** 클릭
4. App Store Connect에서 빌드 확인 (최대 30분 처리)

### 방법 3: Xcode (수동)
```bash
# EAS 대신 로컬 빌드 시
eas build --platform ios --profile production --local
# → Xcode Organizer에서 Upload
```

## Step 8: 빌드 선택 및 제출

1. App Store Connect → **내 앱** → 이우고 코리아
2. 왼쪽 메뉴 **"App Store"** → 버전 정보
3. **"빌드"** 섹션 → **"+"** → 업로드된 빌드 선택
4. 모든 정보 확인 후 **"심사를 위해 제출"** 클릭

## Step 9: 수출 규정 준수

제출 시 수출 규정 관련 질문에 답변:
- **암호화 사용**: 예 (HTTPS/TLS)
- **면제 대상**: 예 (`usesNonExemptEncryption: false` 이미 설정됨)

---

## 심사 체크리스트

### 필수
- [ ] Apple Developer Program 가입 완료
- [ ] 앱 아이콘 (1024x1024, 알파 없음)
- [ ] iPhone 6.7" 스크린샷 최소 3장
- [ ] iPhone 6.5" 스크린샷 최소 3장
- [ ] 개인정보처리방침 URL
- [ ] 지원 URL
- [ ] **Apple 로그인 구현** (소셜 로그인 제공 시 필수)
- [ ] 심사용 데모 계정 준비
- [ ] 콘텐츠 등급 설정

### 중요 확인사항
- [ ] 실물 상품 판매이므로 IAP(인앱결제) 불필요
- [ ] IDFA(광고 추적) 사용 여부 선언
- [ ] 카메라/사진/Face ID 권한 사유 기재 완료
- [ ] 수출 규정 준수 확인 (암호화 면제)

---

## 심사 기간

- 신규 앱: 약 1-3일 (최대 7일, 드물게 2주)
- 업데이트: 약 24시간
- 거절 시: Resolution Center에서 소통 후 재제출

## OTA 업데이트 (심사 없이 업데이트)

```bash
# JavaScript 번들만 변경된 경우 → 심사 없이 즉시 배포
eas update --branch production --message "v1.0.1 - 버그 수정"
```

EAS Update를 사용하면 네이티브 코드 변경이 없는 업데이트를
App Store 심사 없이 즉시 배포할 수 있습니다.

## 전체 빌드 → 제출 → 심사 자동화

```bash
# 빌드 + 자동 제출 (한 줄)
eas build --platform ios --profile production --auto-submit
```

eas.json에 Apple ID와 ASC App ID를 설정하면 빌드 완료 후
자동으로 App Store Connect에 업로드됩니다.
