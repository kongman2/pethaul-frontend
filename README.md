# Pethaul-Frontend

반려동물 용품 이커머스 플랫폼의 React 기반 프론트엔드 애플리케이션입니다.

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [주요 기능](#3-주요-기능)
4. [프로젝트 구조](#4-프로젝트-구조)
5. [개발 가이드](#5-개발-가이드)
6. [배포 가이드](#6-배포-가이드)

---

## 1) 프로젝트 개요

**Pethaul**은 반려동물 용품 전문 이커머스 플랫폼으로, 사용자와 관리자를 위한 완전한 쇼핑 경험을 제공합니다.

### 핵심 특징
- React + Redux Toolkit 기반 SPA
- 반응형 디자인 (모바일/데스크톱)
- 코드 스플리팅 (Lazy Loading)
- 재사용 가능한 컴포넌트 시스템

---

## 2) 기술 스택

### Core
- React 19.1.1, Vite 7.1.1
- Redux Toolkit 2.8.2
- React Router DOM 7.8.0

### UI & Styling
- Sass, React Bootstrap
- Iconify, Tiptap, Recharts, Swiper

### HTTP & API
- Axios 1.11.0

---

## 3) 주요 기능

### 사용자 기능
- 인증: 로컬/구글 OAuth 로그인, JWT 인증
- 마이페이지: 프로필 관리, 반려동물 등록, 주문/교환반품 조회, 리뷰 작성
- 쇼핑: 상품 조회/검색, 장바구니, 주문/결제, 구매확정

### 관리자 기능
- 주문 관리: 주문 조회, 상태 변경, 취소 처리
- 교환/반품 관리: 신청 목록 조회, 승인/거부 처리
- 상품/컨텐츠 관리: 등록/수정/삭제
- 매출 통계: 차트 기반 매출 분석

---

## 4) 프로젝트 구조

```
pethaul-frontend/
├── src/
│   ├── api/              # API 통신 모듈
│   ├── components/       # 재사용 가능한 컴포넌트
│   │   ├── admin/        # 관리자 컴포넌트
│   │   ├── auth/         # 인증 컴포넌트
│   │   ├── common/       # 공통 컴포넌트
│   │   └── ...
│   ├── features/         # Redux Slices
│   ├── hooks/            # Custom Hooks
│   ├── pages/            # 페이지 컴포넌트
│   ├── routes/           # 라우팅 설정
│   ├── store/            # Redux Store
│   ├── styles/           # 전역 스타일
│   └── utils/            # 유틸리티 함수
├── public/               # 정적 리소스
├── vercel.json           # Vercel 배포 설정
└── package.json
```

---

## 5) 개발 가이드

### 브랜치 전략
- `main`: 배포용
- `develop`: 통합 개발 브랜치
- 개별 브랜치: `[이니셜]-[작업유형]-[기능명]` (예: `jsy-feat-popup`)

> 모든 기능 개발은 개별 브랜치에서 수행 후, `develop` 브랜치 기준으로 PR을 생성합니다.

### Git 커밋 메시지 규칙
```
[태그] 작업한 내용 요약

태그: feat, fix, refactor, style, docs, test, chore, remove
예: [feat] 로그인 API 구현
```

### Import 순서
1. 외부 라이브러리 (React, Router, Redux 등)
2. 내부 유틸/전역/서비스 (utils, hooks, api 등)
3. 컴포넌트
4. 스타일 파일

---

## 6) 배포 가이드

### Vercel 배포

프론트엔드는 Vercel을 통해 배포되며, 백엔드 API는 Render에서 호스팅됩니다.

#### 배포 단계

1. **Vercel 프로젝트 생성**
   - Vercel 대시보드에서 "New Project" 클릭
   - GitHub 저장소 선택
   - Root Directory: `pethaul-frontend`

2. **환경 변수 설정**
   ```
   VITE_APP_API_URL=https://pethaul-api.onrender.com
   ```
   > `VITE_APP_AUTH_KEY`는 선택 사항입니다. 백엔드에 `AUTH_KEY`가 있는 경우에만 설정하세요.

3. **배포 확인**
   - 배포 완료 후 제공되는 URL로 접속하여 확인

#### 주의사항
- `vercel.json` 파일이 프로젝트 루트에 있어야 SPA 라우팅이 정상 작동합니다
- 환경 변수 변경 후 재배포가 필요합니다
- Render API 서버의 CORS 설정이 Vercel 도메인을 허용하도록 설정되어 있어야 합니다

---

**Made by Pethaul Team**
