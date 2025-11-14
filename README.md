# Pethaul-Frontend

반려동물 용품 이커머스 플랫폼의 React 기반 프론트엔드 애플리케이션입니다.  
팀원들이 각자의 기능을 브랜치에서 개발한 뒤, `develop` 브랜치로 병합하여 협업합니다.

---

## 목차 (Table of Contents)

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [주요 기능](#3-주요-기능)
4. [시스템 아키텍처](#4-시스템-아키텍처)
5. [프로젝트 구조](#5-프로젝트-구조)
6. [핵심 구현 사항](#6-핵심-구현-사항)
7. [성능 최적화](#7-성능-최적화)
8. [코드 품질 관리](#8-코드-품질-관리)
9. [개발 가이드](#9-개발-가이드)

---

## 1) 프로젝트 개요 (Introduction)

**Pethaul**은 반려동물 용품 전문 이커머스 플랫폼으로, 사용자와 관리자를 위한 완전한 쇼핑 경험을 제공합니다.

### 핵심 특징
- **React + Redux Toolkit 기반 SPA**: 단일 페이지 애플리케이션으로 빠른 사용자 경험 제공
- **반응형 디자인**: 모바일과 데스크톱 환경 모두 지원
- **실시간 상태 관리**: Redux Toolkit을 통한 효율적인 전역 상태 관리
- **코드 스플리팅**: Lazy Loading을 통한 최적화된 번들 크기
- **재사용 가능한 컴포넌트**: 공통 컴포넌트 라이브러리로 일관된 UI/UX

---

## 2) 기술 스택 (Tech Stack)

### Core
- **Framework**: React 19.1.1, Vite 7.1.1
- **State Management**: Redux Toolkit 2.8.2, React-Redux 9.2.0
- **Routing**: React Router DOM 7.8.0

### UI & Styling
- **CSS Preprocessor**: Sass 1.93.3
- **UI Library**: React Bootstrap 2.10.10, Bootstrap 5.3.8
- **Icons**: Iconify React 4.1.0
- **Rich Text Editor**: Tiptap 3.10.7
- **Charts**: Recharts 3.1.2
- **Slider**: Swiper 11.2.10

### HTTP & API
- **HTTP Client**: Axios 1.11.0
- **Date Handling**: Day.js 1.11.13
- **Query String**: qs 6.14.0

### Development Tools
- **Build Tool**: Vite
- **Linting**: ESLint 9.33.0
- **Code Quality**: ESLint React Hooks Plugin

---

## 3) 주요 기능 (Features)

### 사용자 기능
- **인증 시스템**
  - 로컬 회원가입/로그인
  - 구글 OAuth 소셜 로그인
  - 아이디/비밀번호 찾기
  - JWT 기반 인증 관리

- **마이페이지**
  - 프로필 관리 (회원정보 수정)
  - 반려동물 프로필 등록/관리
  - 반려동물 설문조사 기반 맞춤 추천
  - 주문 내역 조회 및 관리
  - 교환/반품 신청 및 조회
  - 취소된 주문 조회
  - 리뷰 작성/수정/삭제
  - 좋아요한 상품 목록
  - 장바구니 관리

- **쇼핑 기능**
  - 상품 목록/상세 조회
  - 상품 검색 및 필터링
  - 카테고리별 정렬
  - 장바구니 추가/수정/삭제
  - 주문 및 결제 처리
  - 구매 확정 기능
  - 교환/반품 신청
  - 상품 문의 (QnA)

- **컨텐츠**
  - 반려동물 관련 컨텐츠 조회
  - 리뷰 작성 및 조회

### 관리자 기능
- **주문 관리**
  - 전체 주문 목록 조회
  - 주문 상태 변경 (판매자확인 → 상품준비중 → 배송중 → 배송완료)
  - 주문 상세 조회 (모달)
  - 주문 취소 처리

- **교환/반품 관리**
  - 교환/반품 신청 목록 조회
  - 상태별 필터링 (대기중/승인됨/거부됨)
  - 타입별 필터링 (교환/반품)
  - 검색 기능
  - 승인/거부 처리 (거부 사유 입력)

- **상품 관리**
  - 상품 등록/수정/삭제
  - 상품 목록 조회 및 필터링
  - 이미지 업로드 관리

- **매출 관리**
  - 차트 기반 매출 통계
  - 기간별 매출 분석

- **컨텐츠 관리**
  - 컨텐츠 등록/수정/삭제
  - 리치 텍스트 에디터 활용

- **QnA 관리**
  - 상품 문의 목록 조회
  - 관리자 답변 등록

---

## 4) 시스템 아키텍처

```
┌─────────────────┐
│   React (Vite)  │
│   Frontend      │
└────────┬────────┘
         │ Axios
         │ (HTTP Client)
         ▼
┌─────────────────┐
│  Express API    │
│  Backend        │
└────────┬────────┘
         │ Sequelize ORM
         ▼
┌─────────────────┐
│     MySQL       │
│   Database      │
└─────────────────┘

         │
         ▼
┌─────────────────┐
│ Redux Toolkit   │
│ (Global State)  │
└─────────────────┘
```

### 데이터 흐름
1. **사용자 액션** → React Component
2. **Redux Thunk** → 비동기 액션 디스패치
3. **Axios API** → Express 백엔드 요청
4. **Sequelize ORM** → MySQL 데이터베이스 쿼리
5. **응답 처리** → Redux Store 업데이트
6. **UI 리렌더링** → React Component 업데이트

[피그마 디자인 링크](https://www.figma.com/design/X5Mcqkr47tfpCU6N13QPLy/project1?node-id=14-99&t=7GAi95jrQTmjhpnn-1)

---

## 5) 프로젝트 구조

```
pethaul-frontend/
├── public/                    # 정적 리소스
│   └── images/               # 공용 이미지
│
├── src/
│   ├── api/                  # API 통신 모듈
│   │   ├── authApi.js        # 인증 API
│   │   ├── axiosApi.js       # Axios 인스턴스 및 인터셉터
│   │   ├── cartApi.js        # 장바구니 API
│   │   ├── contentApi.js     # 컨텐츠 API
│   │   ├── exchangeReturnApi.js  # 교환/반품 API
│   │   ├── itemApi.js        # 상품 API
│   │   ├── likeApi.js        # 좋아요 API
│   │   ├── orderApi.js       # 주문 API
│   │   ├── petApi.js         # 반려동물 API
│   │   ├── qnaApi.js         # 문의 API
│   │   ├── reviewApi.js      # 리뷰 API
│   │   ├── recommend.js      # 추천 API
│   │   └── tokenApi.js       # 토큰 API
│   │
│   ├── assets/               # 이미지, 폰트 등
│   │
│   ├── components/           # 재사용 가능한 컴포넌트
│   │   ├── admin/           # 관리자 전용 컴포넌트
│   │   │   ├── AdminPanelLayout/
│   │   │   ├── AdminFilterForm/
│   │   │   ├── ChartPanel/
│   │   │   ├── ContentPanel/
│   │   │   ├── ItemPanel/
│   │   │   ├── OrderPanel/
│   │   │   └── QnAPanel/
│   │   │
│   │   ├── auth/            # 인증 관련 컴포넌트
│   │   │   ├── AuthFormLayout/
│   │   │   ├── FindFormBase/
│   │   │   ├── LoginForm/
│   │   │   └── RegisterForm/
│   │   │
│   │   ├── common/          # 공통 컴포넌트
│   │   │   ├── Button/      # 버튼 컴포넌트
│   │   │   ├── Input/       # 입력 컴포넌트 (forwardRef 지원)
│   │   │   ├── Textarea/    # 텍스트 영역 컴포넌트
│   │   │   ├── Selector/    # 셀렉터 컴포넌트
│   │   │   ├── Checkbox/    # 체크박스 컴포넌트
│   │   │   ├── Toggle/      # 토글 컴포넌트
│   │   │   ├── Modal/       # 모달 컴포넌트
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── AlertModal.jsx
│   │   │   │   └── ConfirmModal.jsx
│   │   │   ├── SectionCard/ # 섹션 카드 컴포넌트
│   │   │   ├── ItemCard/    # 상품 카드 컴포넌트 (React.memo)
│   │   │   ├── Spinner/     # 로딩 스피너
│   │   │   ├── Pagination/   # 페이지네이션
│   │   │   ├── Tabs/        # 탭 컴포넌트
│   │   │   ├── FilterForm/  # 필터 폼
│   │   │   ├── SortDropdown/ # 정렬 드롭다운
│   │   │   ├── QuantityControl/ # 수량 제어
│   │   │   ├── ImageUpload/  # 이미지 업로드
│   │   │   ├── RichTextEditor/ # 리치 텍스트 에디터 (Tiptap)
│   │   │   ├── PageHeader/  # 페이지 헤더
│   │   │   └── index.js     # 공통 컴포넌트 export
│   │   │
│   │   ├── contents/        # 컨텐츠 관련 컴포넌트
│   │   │   ├── AdminContentForm/
│   │   │   ├── ContentCard/
│   │   │   ├── ContentDetailForm/
│   │   │   ├── ContentGrid/
│   │   │   ├── ContentHero/
│   │   │   └── Skeletons/
│   │   │
│   │   ├── item/            # 상품 관련 컴포넌트
│   │   │   ├── ItemFormBase/
│   │   │   ├── ItemRecommend/
│   │   │   ├── ItemSellList/
│   │   │   └── ItemListLayout/
│   │   │
│   │   ├── layout/          # 레이아웃 컴포넌트
│   │   │   ├── AppLayout/
│   │   │   ├── Navbar/
│   │   │   ├── Footer/
│   │   │   ├── MobileTabBar/
│   │   │   ├── MenuDropdown/
│   │   │   └── UserMenuPopover/
│   │   │
│   │   ├── main/            # 메인 페이지 컴포넌트
│   │   │   ├── BannerSection/
│   │   │   ├── BestProductsSection/
│   │   │   ├── ContentsReviewSection/
│   │   │   ├── NewItemsSection/
│   │   │   ├── PetSurveySection/
│   │   │   ├── SeasonPromotionSection/
│   │   │   └── common/
│   │   │       └── ItemSectionGrid/
│   │   │
│   │   ├── modal/           # 모달 컴포넌트
│   │   │   ├── PetProfileSuccessModal/
│   │   │   └── verify/
│   │   │       └── VerifyModal/
│   │   │
│   │   ├── My/              # 마이페이지 컴포넌트
│   │   │   ├── MenuBar/
│   │   │   ├── OrderState/
│   │   │   ├── PetProfileCard/
│   │   │   └── Profile/
│   │   │
│   │   ├── order/           # 주문 관련 컴포넌트
│   │   │   ├── CouponModal/
│   │   │   └── OrderForm/
│   │   │
│   │   ├── Qna/             # 문의 관련 컴포넌트
│   │   │   ├── QnABase/
│   │   │   └── QnATable/
│   │   │
│   │   ├── review/          # 리뷰 관련 컴포넌트
│   │   │   ├── ItemReviewList/
│   │   │   ├── ReviewForm/
│   │   │   ├── ReviewItem/
│   │   │   └── ReviewSlider/
│   │   │
│   │   └── slider/          # 슬라이더 컴포넌트
│   │       ├── NewContentsSlider/
│   │       ├── PetProfileSlider/
│   │       └── ReviewSlider/
│   │
│   ├── contexts/            # React Context
│   │   └── AppBackgroundContext.jsx
│   │
│   ├── features/            # Redux Slices
│   │   ├── authSlice.js     # 인증 상태 관리
│   │   ├── cartSlice.js     # 장바구니 상태 관리
│   │   ├── contentSlice.js   # 컨텐츠 상태 관리
│   │   ├── exchangeReturnSlice.js  # 교환/반품 상태 관리
│   │   ├── filterSlice.js   # 필터 상태 관리
│   │   ├── itemSlice.js     # 상품 상태 관리
│   │   ├── likeSlice.js     # 좋아요 상태 관리
│   │   ├── orderSlice.js    # 주문 상태 관리
│   │   ├── petSlice.js      # 반려동물 상태 관리
│   │   ├── qnaSlice.js      # 문의 상태 관리
│   │   ├── reviewSlice.js   # 리뷰 상태 관리
│   │   └── tokenSlice.js    # 토큰 상태 관리
│   │
│   ├── hooks/               # Custom Hooks
│   │   ├── useAlertModal.js      # Alert 모달 훅
│   │   ├── useAppBackground.js   # 배경 컨텍스트 훅
│   │   ├── useArrowPosition.js   # 화살표 위치 훅
│   │   ├── useClickOutside.js    # 외부 클릭 감지 훅
│   │   ├── useConfirmModal.js    # Confirm 모달 훅
│   │   ├── useDisclosure.js      # 열림/닫힘 상태 훅
│   │   ├── useDropdown.js        # 드롭다운 훅
│   │   ├── useItemFilters.js     # 상품 필터 훅
│   │   └── useModalHelpers.js     # 모달 헬퍼 통합 훅
│   │
│   ├── pages/               # 페이지 컴포넌트
│   │   ├── Admin/
│   │   │   └── AdminPage.jsx
│   │   ├── Auth/
│   │   │   └── AuthPage.jsx
│   │   ├── Contents/
│   │   │   ├── ContentsPage.jsx
│   │   │   ├── ContentDetailPage.jsx
│   │   │   └── ContentUpsertPage.jsx
│   │   ├── Item/
│   │   │   ├── ItemCartPage.jsx
│   │   │   ├── itemDetailPage.jsx
│   │   │   ├── ItemFormPage.jsx
│   │   │   ├── ItemLikePage.jsx
│   │   │   └── ItemSellListPage.jsx
│   │   ├── Main/
│   │   │   └── MainPage.jsx
│   │   ├── My/
│   │   │   ├── EditMyInfoPage.jsx
│   │   │   ├── MyExchangeReturnList.jsx
│   │   │   ├── MyOrderList.jsx
│   │   │   ├── MyPage.jsx
│   │   │   └── MyReviewList.jsx
│   │   ├── Order/
│   │   │   └── OrderPage.jsx
│   │   ├── Pet/
│   │   │   ├── PetFormPage.jsx
│   │   │   └── PetSurveyResultPage.jsx
│   │   ├── Qna/
│   │   │   ├── QnAFormPage.jsx
│   │   │   └── QnAListPage.jsx
│   │   ├── Review/
│   │   │   ├── LatestReviewPage.jsx
│   │   │   ├── ReviewDetailPage.jsx
│   │   │   ├── ReviewFormPage.jsx
│   │   │   └── ReviewListPage.jsx
│   │   └── Token/
│   │       └── TokenPage.jsx
│   │
│   ├── routes/              # 라우팅 설정
│   │   ├── AppRouter.jsx    # 메인 라우터
│   │   ├── ProtectedRoute.jsx  # 보호된 라우트
│   │   └── routes.config.jsx   # 라우트 설정 (Lazy Loading)
│   │
│   ├── store/               # Redux Store
│   │   └── store.js
│   │
│   ├── styles/              # 전역 스타일
│   │   ├── components/
│   │   ├── mixins/
│   │   ├── utilities/
│   │   └── variables.scss
│   │
│   ├── utils/               # 유틸리티 함수
│   │   ├── getTokenErrorMessage.js
│   │   ├── imageUtils.js    # 이미지 URL 처리
│   │   ├── itemFilters.js   # 상품 필터 유틸
│   │   ├── modalUtils.js    # 모달 유틸
│   │   ├── performanceUtils.js
│   │   ├── phoneFormat.js   # 전화번호 포맷팅
│   │   ├── priceSet.js      # 가격 포맷팅
│   │   └── reviewUtils.js   # 리뷰 유틸
│   │
│   ├── App.jsx              # 메인 앱 컴포넌트
│   ├── index.scss           # 전역 스타일
│   └── main.jsx             # 진입점
│
├── .env                     # 환경 변수
├── .gitignore
├── eslint.config.js         # ESLint 설정
├── index.html               # HTML 템플릿
├── package.json
├── package-lock.json
├── README.md
└── vite.config.js           # Vite 설정
```

---

## 6) 핵심 구현 사항

### 주요 기능 구현

#### 1. 교환/반품 관리 시스템
- **사용자 기능**
  - 교환/반품 신청 (사유 입력, 이미지 업로드)
  - 교환/반품 신청 목록 조회 (상태별 필터링)
  - 취소된 주문 조회
  - 상세 정보 드롭다운 표시
  - 교환/반품 약관 동의 체크박스

- **관리자 기능**
  - 교환/반품 신청 목록 조회 (필터: 상태, 타입, 검색)
  - 승인/거부 처리
  - 거부 사유 입력 모달
  - 주문 상세 정보 모달

#### 2. 주문 관리 시스템
- **사용자 기능**
  - 주문 내역 조회 (페이지네이션)
  - 주문 상세 조회 (모달)
  - 주문 취소 (ORDER 상태만 가능)
  - 구매 확정 기능
  - 구매 확정 배지 표시
  - 교환/반품 신청

- **관리자 기능**
  - 전체 주문 목록 조회
  - 주문 상태 변경 (ORDER → READY → SHIPPED → DELIVERED)
  - 주문 상세 조회 (모달)
  - 주문 취소 처리

#### 3. 공통 컴포넌트 시스템
- **모달 컴포넌트**
  - `Modal`: 기본 모달 컴포넌트
  - `AlertModal`: 알림 모달 (success, warning, danger, info)
  - `ConfirmModal`: 확인 모달

- **폼 컴포넌트**
  - `Input`: forwardRef 지원, 비밀번호 토글, 우측 버튼
  - `Textarea`: 다중 라인 입력
  - `Selector`: 드롭다운 셀렉터
  - `Checkbox`: 체크박스
  - `Toggle`: 토글 스위치

- **레이아웃 컴포넌트**
  - `SectionCard`: 섹션 카드 (접기/펼치기 지원)
  - `ItemCard`: 상품 카드 (React.memo 최적화)
  - `Button`: 버튼 컴포넌트 (React.memo 최적화)
  - `Tabs`: 탭 컴포넌트 (일관된 스타일)

#### 4. 커스텀 훅 시스템
- `useModalHelpers`: AlertModal과 ConfirmModal 통합 훅
- `useAlertModal`: Alert 모달 전용 훅
- `useConfirmModal`: Confirm 모달 전용 훅
- `useAppBackground`: 배경 컨텍스트 훅
- `useItemFilters`: 상품 필터링 로직 훅

#### 5. 상태 관리 최적화
- Redux Toolkit을 활용한 효율적인 상태 관리
- 비동기 액션 처리 (createAsyncThunk)
- 선택적 리렌더링 (useSelector 최적화)
- 메모이제이션을 통한 성능 최적화

---

## 7) 성능 최적화

### 코드 스플리팅 (Code Splitting)
- **Lazy Loading**: 모든 페이지 컴포넌트를 lazy import로 로드
- **Suspense**: 페이지 로딩 중 로딩 컴포넌트 표시
- **번들 크기 최적화**: 초기 로딩 시간 단축

```jsx
// routes.config.jsx
const MainPage = lazy(() => import('../pages/Main/MainPage'))
const ItemDetailPage = lazy(() => import('../pages/Item/itemDetailPage'))
// ... 모든 페이지 lazy import
```

### 컴포넌트 최적화
- **React.memo**: `ItemCard`, `Button` 컴포넌트 메모이제이션
- **useMemo**: 복잡한 계산 결과 메모이제이션
- **useCallback**: 함수 참조 안정화

### 이미지 최적화
- 이미지 URL 유틸리티 함수로 절대 경로 변환
- 플레이스홀더 이미지 처리
- 이미지 업로드 최적화

---

## 8) 코드 품질 관리

### Import 순서 규칙
모든 파일에서 다음 순서로 import를 정리합니다:

1. **외부 라이브러리** (React, Router, Redux 등)
2. **내부 유틸/전역/서비스** (utils, hooks, api 등)
3. **컴포넌트** (공통/도메인 컴포넌트)
4. **스타일** (scss/css)

각 그룹 사이에는 한 줄 공백을 추가합니다.

### 모달 시스템 통합
- 모든 `alert()`, `confirm()` 호출을 커스텀 모달로 대체
- `useModalHelpers` 훅을 통한 일관된 모달 사용
- 사용자 경험 개선

---

## 9) 개발 가이드

### Import 순서 가이드

코드 작성 시, 다음과 같은 순서로 import 문을 정렬해주세요:

#### 1. 외부 라이브러리
React, React Router, Redux, Bootstrap 등
```jsx
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'
```

#### 2. 내부 유틸 / 전역 설정 / API 모듈
utils, hooks, context, api 등
```jsx
import { fetchItemByIdThunk } from '../../features/itemSlice'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import { getPlaceholderImage } from '../../utils/imageUtils'
```

#### 3. 컴포넌트
직접 만든 컴포넌트들 (공통 또는 특정 도메인 컴포넌트 포함)
```jsx
import { Button, Input, SectionCard, AlertModal } from '../../components/common'
import ItemReviewList from '../../components/review/ItemReviewList'
```

#### 4. 스타일 파일
css, scss 등
```jsx
import './ItemDetailPage.scss'
```

---

### 브랜치 전략

- `main`: 배포용
- `develop`: 통합 개발 브랜치
- `hcm`: 한창민
- `jsy`: 정세연
- `jse`: 정송이
- `ysy`: 윤승영

> 모든 기능 개발은 **개별 브랜치에서 수행 후**,  
> 반드시 `develop` 브랜치 기준으로 **PR(Pull Request)** 을 생성해주세요.

---

### 브랜치 작업 및 Push 방법

#### 1. 브랜치 최초 이동
```bash
git checkout -t origin/브랜치이름

# 예
git checkout -t origin/hcm

# 이후 작업할 때는
git checkout 브랜치이름

# 최초 Push 연결
git push --set-upstream origin 브랜치이름

# 이후부터는 그냥 git push 만 해도 됩니다.
```

---

### 신규 브랜치 생성 규칙

기능이 세분화되거나 테스트/임시 작업이 필요한 경우, 아래 규칙에 따라 **개별 브랜치에서 파생 브랜치**를 생성할 수 있습니다.

#### 브랜치 네이밍 규칙
`[이니셜]-[작업유형]-[기능이름]`

예시:
- `jsy-feat-popup` → 정세연 님이 팝업 기능 개발
- `hcm-fix-login-bug` → 한창민 님이 로그인 버그 수정
- `jse-test-api-token` → 정송이 님이 토큰 API 테스트

#### 브랜치 생성 명령어
```bash
git checkout -b 본인지명-작업유형-기능명
git push -u origin 본인지명-작업유형-기능명

예:
git checkout -b jsy-feat-chat-ui
git push -u origin jsy-feat-chat-ui
```

> ❗ 브랜치를 새로 생성할 때는 팀 리더와 간단히 공유 후 작업해주세요.  
> 작업 완료 후에는 develop 브랜치 기준으로 Pull Request를 생성합니다.

---

### Git 커밋 메시지 작성 규칙

커밋 메시지는 형식과 내용을 명확하게 작성해야 협업 시 변경 내역을 빠르게 파악할 수 있습니다.

#### 기본 형식
```bash
git commit -m "[태그] 작업한 내용 요약"

# 예:
git commit -m "[feat] 로그인 API 구현"
git commit -m "[fix] 장바구니 오류 수정"
git commit -m "[style] 버튼 정렬 개선"
```

#### 커밋 태그 종류

| 태그       | 설명                                        |
| ---------- | ------------------------------------------- |
| `feat`     | 새로운 기능 추가                            |
| `fix`      | 버그 수정                                   |
| `refactor` | 코드 리팩토링 (기능 변화 없음)              |
| `style`    | 스타일, 포맷팅, 주석 등 UI 외 변경          |
| `docs`     | 문서 (README 등) 변경                       |
| `test`     | 테스트 코드 추가/수정                       |
| `chore`    | 빌드, 패키지 매니저, 설정 파일 등 기타 작업 |
| `remove`   | 불필요한 코드/파일 제거                     |

#### 커밋 메시지 팁
- 커밋 메시지는 **한 줄 요약**, 50자 이내 권장
- 작업 내용을 명확히 드러내는 동사를 사용
- PR 리뷰자가 한눈에 파악할 수 있도록 작성

#### 예시
- `[feat] 상품 상세 페이지 레이아웃 구현`
- `[fix] 로그인 실패 시 에러 메시지 표시`
- `[refactor] useEffect 로직 정리`
- `[style] ChartPage 컴포넌트 마진 조정`
- `[test] orderSlice 테스트 코드 작성`
- `[chore] ESLint 룰 추가 및 적용`
- `[docs] README.md에 커밋 규칙 추가`

---

##  최근 개선 사항 (Recent Improvements)

### 코드 품질 개선
- 모든 `alert()`, `confirm()` 호출을 커스텀 모달 컴포넌트로 대체
- 공통 컴포넌트 시스템 구축 (Input, Button, Selector, Modal 등)
- 커스텀 훅을 통한 코드 재사용성 향상
- Import 순서 통일 및 정리
- 불필요한 주석 및 이모티콘 제거
- 디버깅용 console.log 제거

### 기능 개선
- 교환/반품 관리 시스템 구현
- 구매 확정 기능 추가
- 주문 상세 조회 모달 구현
- 관리자 주문 관리 UI 개선
- 탭 컴포넌트 통일 및 스타일 일관성 확보

### 성능 최적화
- Lazy Loading을 통한 코드 스플리팅
- React.memo를 활용한 컴포넌트 최적화
- useMemo, useCallback을 통한 불필요한 리렌더링 방지

---

## 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

**Made by Pethaul Team**
