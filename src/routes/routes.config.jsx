// 라우트 설정 파일
import { lazy } from 'react'

// Lazy Loading으로 코드 스플리팅
const MainPage = lazy(() => import('../pages/Main/MainPage'))
const AuthPage = lazy(() => import('../pages/Auth/AuthPage'))
const TokenPage = lazy(() => import('../pages/Token/TokenPage'))

// Item 관련
const ItemSellListPage = lazy(() => import('../pages/Item/ItemSellListPage'))
const ItemDetailPage = lazy(() => import('../pages/Item/itemDetailPage'))
const ItemFormPage = lazy(() => import('../pages/Item/ItemFormPage'))
const ItemLikePage = lazy(() => import('../pages/Item/ItemLikePage'))
const ItemCartPage = lazy(() => import('../pages/Item/ItemCartPage'))

// Order 관련
const OrderPage = lazy(() => import('../pages/Order/OrderPage'))
const MyOrderList = lazy(() => import('../pages/My/MyOrderList'))
const MyExchangeReturnList = lazy(() => import('../pages/My/MyExchangeReturnList'))

// Review 관련
const ReviewFormPage = lazy(() => import('../pages/Review/ReviewFormPage'))
const ReviewDetailPage = lazy(() => import('../pages/Review/ReviewDetailPage'))
const ReviewListPage = lazy(() => import('../pages/Review/ReviewListPage'))
const MyReviewList = lazy(() => import('../pages/My/MyReviewList'))
const LatestReviewPage = lazy(() => import('../pages/Review/LatestReviewPage'))

// QnA 관련
const QnAFormPage = lazy(() => import('../pages/Qna/QnAFormPage'))
const QnAListPage = lazy(() => import('../pages/Qna/QnAListPage'))

// Contents 관련
const ContentsPage = lazy(() => import('../pages/Contents/ContentsPage'))
const ContentDetailPage = lazy(() => import('../pages/Contents/ContentDetailPage'))
const ContentUpsertPage = lazy(() => import('../pages/Contents/ContentUpsertPage'))

// My 관련
const MyPage = lazy(() => import('../pages/My/MyPage'))
const EditMyInfoPage = lazy(() => import('../pages/My/EditMyInfoPage'))

// Admin 관련
const AdminPage = lazy(() => import('../pages/Admin/AdminPage'))

// Pet 관련
const PetFormPage = lazy(() => import('../pages/Pet/PetFormPage'))
const PetSurveyResultPage = lazy(() => import('../pages/Pet/PetSurveyResultPage'))

// 라우트 경로 상수
export const ROUTES = {
  HOME: '/',
  
  // Auth
  JOIN: '/join',
  LOGIN: '/login',
  GOOGLE_SUCCESS: '/google-success',
  FIND_ID: '/find-id',
  FIND_PASSWORD: '/find-password',
  TOKEN: '/token',
  
  // Item
  ITEMS: '/item',
  ITEM_DETAIL: '/items/detail/:id',
  ITEM_CREATE: '/items/create',
  ITEM_EDIT: '/items/edit/:id',
  ITEM_SEARCH: '/items/search',
  ITEM_SORTED: '/items/sorted',
  ITEM_LIKES: '/likes/item',
  CART: '/cart',
  
  // Order
  ORDER: '/order',
  MY_ORDERS: '/myorderlist',
  MY_EXCHANGE_RETURNS: '/myexchangereturnlist',
  
  // Review
  REVIEW_CREATE: '/review/create',
  REVIEW_EDIT: '/review/edit/:id',
  REVIEW_DETAIL: '/reviews/:id',
  MY_REVIEWS: '/myreviewlist',
  REVIEWS: '/reviews',
  
  // QnA
  QNA_CREATE: '/qna',
  QNA_EDIT: '/qna/edit/:id',
  MY_QNA: '/myQnAlist',
  
  // Contents
  CONTENTS: '/contents',
  CONTENT_DETAIL: '/contents/:id',
  CONTENT_CREATE: '/contents/new',
  CONTENT_EDIT: '/admin/contents/:id/edit',
  
  // My Page
  MY_PAGE: '/mypage',
  MY_PAGE_EDIT: '/mypage/edit',
  
  // Admin
  ADMIN: '/admin',
  
  // Pet
  PET_CREATE: '/pets',
  PET_EDIT: '/peteditpage',
  PET_SURVEY_RESULT: '/pet-survey-result',
  
  // Verify Modal
  VERIFY: '/verify',
}

// 라우트 설정 (그룹별)
export const routeConfig = {
  // Public Routes
  public: [
    { path: ROUTES.HOME, element: MainPage },
    { path: ROUTES.ITEMS, element: ItemSellListPage },
    { path: ROUTES.ITEM_DETAIL, element: ItemDetailPage },
    { path: ROUTES.ITEM_SEARCH, element: ItemSellListPage },
    { path: ROUTES.ITEM_SORTED, element: ItemSellListPage },
    { path: ROUTES.CONTENTS, element: ContentsPage },
    { path: ROUTES.CONTENT_DETAIL, element: ContentDetailPage },
    { path: ROUTES.REVIEWS, element: ReviewListPage },
    { path: ROUTES.REVIEW_DETAIL, element: ReviewDetailPage },
    { path: ROUTES.PET_SURVEY_RESULT, element: PetSurveyResultPage },
  ],
  
  // Auth Routes
  auth: [
    { path: ROUTES.JOIN, element: AuthPage },
    { path: ROUTES.LOGIN, element: AuthPage },
    { path: ROUTES.GOOGLE_SUCCESS, element: AuthPage },
    { path: ROUTES.FIND_ID, element: AuthPage },
    { path: ROUTES.FIND_PASSWORD, element: AuthPage },
  ],
  
  // Protected Routes (로그인 필요)
  protected: [
    { path: ROUTES.TOKEN, element: TokenPage },
    { path: ROUTES.ITEM_LIKES, element: ItemLikePage },
    { path: ROUTES.CART, element: ItemCartPage },
    { path: ROUTES.ORDER, element: OrderPage },
    { path: ROUTES.MY_ORDERS, element: MyOrderList },
    { path: ROUTES.MY_EXCHANGE_RETURNS, element: MyExchangeReturnList },
    { path: ROUTES.REVIEW_CREATE, element: ReviewFormPage },
    { path: ROUTES.REVIEW_EDIT, element: ReviewFormPage },
    { path: ROUTES.MY_REVIEWS, element: MyReviewList }, // 리다이렉트용 유지
    { path: ROUTES.QNA_CREATE, element: QnAFormPage, props: { mode: 'create' } },
    { path: ROUTES.QNA_EDIT, element: QnAFormPage, props: { mode: 'edit' } },
    { path: ROUTES.MY_QNA, element: QnAListPage },
    { path: ROUTES.MY_PAGE, element: MyPage },
    { path: ROUTES.MY_PAGE_EDIT, element: EditMyInfoPage },
    { path: ROUTES.PET_CREATE, element: PetFormPage, props: { mode: 'create' } },
    { path: ROUTES.PET_EDIT, element: PetFormPage, props: { mode: 'edit' } },
  ],
  
  // Admin Routes (관리자 전용)
  admin: [
    { path: ROUTES.ITEM_CREATE, element: ItemFormPage },
    { path: ROUTES.ITEM_EDIT, element: ItemFormPage },
    { path: ROUTES.CONTENT_CREATE, element: ContentUpsertPage },
    { path: ROUTES.CONTENT_EDIT, element: ContentUpsertPage },
    { path: ROUTES.ADMIN, element: AdminPage },
  ],
}

export default routeConfig

