# 🚀 프로젝트 세팅 가이드

## 초기 설정

### 1. 환경 변수 설정

`.env` 파일에서 아래 값들을 설정해주세요:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_KAKAO_APP_KEY=YOUR_KAKAO_APP_KEY
```

#### Kakao Map API 키 발급 방법

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 로그인 후 '내 애플리케이션' 메뉴로 이동
3. '애플리케이션 추가하기' 클릭
4. 앱 이름 입력 후 저장
5. '앱 키' 탭에서 'JavaScript 키' 복사
6. `.env` 파일의 `VITE_KAKAO_APP_KEY`에 붙여넣기
7. '플랫폼' 탭에서 Web 플랫폼 추가
   - 사이트 도메인: `http://localhost:5173` (개발 서버 주소)

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 주요 의존성 패키지

### 핵심

- `react` (^18.3.1) - UI 라이브러리
- `react-router-dom` (^6.22.0) - 라우팅
- `zustand` (^4.5.0) - 상태 관리
- `axios` (^1.6.7) - HTTP 클라이언트

### 스타일링

- `tailwindcss` (^3.4.1) - CSS 프레임워크
- `autoprefixer` (^10.4.17) - CSS 벤더 프리픽스
- `postcss` (^8.4.35) - CSS 처리

### 개발 도구

- `typescript` (^5.3.3) - 타입 체크
- `vite` (^5.1.0) - 빌드 도구
- `eslint` (^8.56.0) - 린터
- `prettier` (^3.2.5) - 코드 포맷터

## 프로젝트 구조

```
Streetball_Frontend/
├── public/              # 정적 파일
│   └── vite.svg
├── src/
│   ├── apis/           # API 통신
│   │   ├── axios.ts    # Axios 인스턴스 설정
│   │   ├── authApi.ts  # 인증 API
│   │   └── gameApi.ts  # 게임 API
│   ├── components/     # 재사용 컴포넌트
│   │   ├── Modal.tsx
│   │   ├── GameModal.tsx
│   │   └── CreateGameModal.tsx
│   ├── hooks/          # 커스텀 훅
│   │   ├── useGeolocation.ts  # 위치 정보
│   │   └── useKakaoMap.ts     # 카카오 맵
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── MapPage.tsx
│   ├── store/          # Zustand 스토어
│   │   ├── authStore.ts
│   │   └── gameStore.ts
│   ├── styles/         # 스타일
│   │   └── index.css
│   ├── types/          # TypeScript 타입
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .eslintrc.cjs       # ESLint 설정
├── .prettierrc         # Prettier 설정
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

## 사용 가능한 스크립트

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# ESLint 실행
npm run lint

# Prettier 포맷팅
npm run format
```

## 백엔드 API 연동

이 프론트엔드는 백엔드 API가 필요합니다. 다음 엔드포인트들이 구현되어 있어야 합니다:

### 인증 API

- `POST /api/auth/login`
  - Body: `{ email: string, password: string }`
  - Response: `{ success: boolean, data: { user: User, token: string } }`

- `POST /api/auth/register`
  - Body: `{ email: string, password: string, name: string }`
  - Response: `{ success: boolean, data: { user: User, token: string } }`

- `PUT /api/auth/location`
  - Body: `{ latitude: number, longitude: number }`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, data: User }`

### 게임 API

- `GET /api/games/nearby?latitude=37.5665&longitude=126.978&radius=5`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, data: Game[] }`

- `POST /api/games`
  - Body: `CreateGameData`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, data: Game }`

- `POST /api/games/:id/join`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean, data: Game }`

- `DELETE /api/games/:id`
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success: boolean }`

## 개발 팁

### Path Alias 사용

`@` 경로로 `src/` 디렉토리에 접근:

```typescript
import { User } from '@/types';
import { gameApi } from '@/apis/gameApi';
import Modal from '@/components/Modal';
```

### 상태 관리

Zustand를 사용한 전역 상태 관리:

```typescript
// 인증 상태
import { useAuthStore } from '@/store/authStore';
const { user, token, isAuthenticated, setAuth, logout } = useAuthStore();

// 게임 상태
import { useGameStore } from '@/store/gameStore';
const { games, selectedGame, setGames, setSelectedGame } = useGameStore();
```

### 위치 권한

사용자의 위치 정보 접근 권한이 필요합니다. 브라우저에서 위치 권한을 허용해야 합니다.

권한이 거부된 경우 기본 위치(서울 시청)가 사용됩니다.

## 트러블슈팅

### 지도가 표시되지 않는 경우

1. `.env` 파일에 Kakao API 키가 올바르게 설정되어 있는지 확인
2. `index.html`에서 Kakao Map SDK가 로드되는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### 위치 정보를 가져오지 못하는 경우

1. HTTPS 또는 localhost에서 실행 중인지 확인 (HTTP에서는 Geolocation이 작동하지 않음)
2. 브라우저 설정에서 위치 권한이 허용되어 있는지 확인

### API 호출이 실패하는 경우

1. 백엔드 서버가 실행 중인지 확인
2. `.env`의 `VITE_API_BASE_URL`이 올바른지 확인
3. CORS 설정이 올바른지 확인
4. 네트워크 탭에서 요청/응답 확인

## 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

환경 변수는 Vercel 대시보드에서 설정하세요.

### Netlify 배포

1. GitHub에 푸시
2. Netlify에 로그인
3. 'New site from Git' 클릭
4. 리포지토리 선택
5. Build command: `npm run build`
6. Publish directory: `dist`
7. 환경 변수 설정

## 라이센스

MIT
