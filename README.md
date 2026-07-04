# I-OGO — 국제기구 커리어 네비게이터

외교부 공공데이터를 기반으로, 국제기구 커리어를 준비하는 한국 학생에게 채용·인턴 공고와 커리어 인사이트를 제공하는 웹 서비스입니다.

> UN-GOGO 팀 프로젝트의 프론트엔드 레포지토리입니다. 데이터 가공은 별도 백엔드(FastAPI)가 담당합니다.

## 기술 스택

- **Next.js 16** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** + **shadcn/ui** (Base UI 프리미티브, Radix 아님)
- **Supabase** (`@supabase/ssr`) — 인증 / 사용자 데이터
- **react-hook-form** + **zod** — 폼 검증
- 패키지 매니저 **pnpm**, Node **>=20**

## 시작하기

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

## 환경 변수

루트에 `.env` 파일을 만들고 아래 키를 채웁니다 (gitignore 처리됨, 값은 팀에 문의).

```bash
NEXT_PUBLIC_BACKEND_URL=                 # FastAPI 백엔드 주소
NEXT_PUBLIC_SUPABASE_URL=                # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=    # Supabase publishable key
```

## 스크립트

```bash
pnpm dev            # 개발 서버
pnpm build          # 프로덕션 빌드 (CI에서 실행 — 반드시 통과해야 함)
pnpm lint           # ESLint
pnpm lint:fix       # ESLint --fix
pnpm format         # Prettier --write
pnpm format:check   # Prettier --check
```

커밋 시 Husky `pre-commit` 훅이 `lint-staged`(eslint --fix + prettier)를 자동 실행합니다.

## 폴더 구조

```
src/
├─ app/                 # App Router 라우트
│  ├─ (auth)/           # login · signup · onboarding
│  └─ (app)/            # jobs · compass · insight · chat · mypage · saved · notifications · profile
├─ components/
│  ├─ ui/               # shadcn/ui 컴포넌트
│  └─ ...               # 도메인별 컴포넌트 (jobs, chat, profile ...)
└─ lib/
   ├─ api/              # 백엔드(FastAPI) 호출 레이어
   ├─ supabase/         # Supabase 클라이언트
   ├─ validations/      # zod 스키마
   └─ utils.ts          # cn() 헬퍼
```
