# 앱 아이콘 및 에셋 가이드

앱 스토어 제출 전 아래 파일들을 이 디렉토리에 준비해주세요.

## 필수 파일

### 1. icon.png (앱 아이콘)
- **크기**: 1024 x 1024 px
- **형식**: PNG (투명 배경 불가, 알파 채널 없음)
- **용도**: iOS App Store, Android Play Store 공통
- 모서리 둥글게 처리는 OS가 자동으로 함 (정���각형으로 제출)

### 2. adaptive-icon.png (Android 적응형 아이콘)
- **크기**: 1024 x 1024 px
- **형식**: PNG (투명 배경 가능)
- **용도**: Android 8.0+ 적응형 아이콘의 전경(foreground) 이미지
- **주의**: 아이콘을 중앙 70% 영�� 안에 배치 (나머지는 잘릴 수 있음)
- **배경색**: app.json에서 #b32008로 설정됨

### 3. splash.png (스플래시 스크린)
- **크기**: 1284 x 2778 px (iPhone 14 Pro Max 기준)
- **형식**: PNG
- **용도**: 앱 로딩 시 표시되는 화면
- **배경색**: app.json에서 #b32008로 설정됨

### 4. notification-icon.png (알림 아이콘, Android 전용)
- **크기**: 96 x 96 px
- **형식**: PNG (투명 배경, 단색 흰색)
- **용도**: Android 알림바에 표시되는 작은 아이콘

## 디자인 가이드라인

### 브랜드 컬러
- Primary: #b32008 (이우고 레드)
- Background: #fcf9f8
- Text: #1c1b1f

### 아이콘 디자인 권장
- 이우고 코리아 로고 또는 "이" 한글 심볼
- 심플하고 인식 가능한 디자인
- 작은 크기에서도 명확하게 보이도록

## 생성 도구
- [Figma](https://figma.com) - 디자인
- [Icon Kitchen](https://icon.kitchen) - AI 아이콘 생성
- [App Icon Generator](https://www.appicon.co) - 크기별 자동 생성
