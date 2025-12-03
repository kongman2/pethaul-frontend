// 리팩토링된 AppRouter
import { Suspense, useEffect, useRef } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import AppLayout from '../components/layout/AppLayout'
import VerifyModal from '../components/modal/verify/VerifyModal'
import ProtectedRoute from './ProtectedRoute'
import { routeConfig, ROUTES } from './routes.config'
// 로딩 컴포넌트 (코드 스플리팅 폴백 - 보통 100ms 이하로 빠름)
// 각 페이지가 자체 데이터 로딩을 처리하므로 최소화
const PageLoader = () => null

function AppRouter() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const backgroundLocation = location.state?.backgroundLocation
  const isVerifyRoute = location.pathname === ROUTES.VERIFY
  const shouldShowVerifyModal = Boolean(backgroundLocation) && isVerifyRoute

  // 페이지 전환 시 스크롤을 맨 위로 이동
  useEffect(() => {
    // backgroundLocation이 있으면 모달이므로 스크롤 이동하지 않음
    if (!backgroundLocation) {
      window.scrollTo(0, 0)
    }
  }, [location.pathname, location.search, backgroundLocation])

  // 브라우저 뒤로가기/앞으로가기 시에도 스크롤 복원 방지
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Verify 모달 라우팅 처리
  useEffect(() => {
    if (isVerifyRoute && !backgroundLocation) {
      navigate(ROUTES.HOME, { replace: true })
    }
  }, [isVerifyRoute, backgroundLocation, navigate])

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route element={<AppLayout />}>
          {/* Public Routes */}
          {routeConfig.public.map(({ path, element: Element, props = {} }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Element {...props} />
                </Suspense>
              }
            />
          ))}

          {/* Auth Routes */}
          {routeConfig.auth.map(({ path, element: Element, props = {} }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<PageLoader />}>
                  <Element {...props} />
                </Suspense>
              }
            />
          ))}

          {/* Protected Routes (로그인 필요) */}
          {routeConfig.protected.map(({ path, element: Element, props = {} }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute>
                  <Suspense fallback={<PageLoader />}>
                    <Element {...props} />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          ))}

          {/* Admin Routes (관리자 전용) */}
          {routeConfig.admin.map(({ path, element: Element, props = {} }) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute requireAdmin>
                  <Suspense fallback={<PageLoader />}>
                    <Element {...props} />
                  </Suspense>
                </ProtectedRoute>
              }
            />
          ))}

          {/* 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Route>
      </Routes>

      {/* Verify Modal */}
      {shouldShowVerifyModal && <VerifyModal />}
    </>
  )
}

export default AppRouter
