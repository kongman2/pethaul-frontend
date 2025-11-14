// Protected Route 컴포넌트
import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ROUTES } from './routes.config'
import { Spinner } from '../components/common'

// 로그인이 필요한 라우트를 보호 

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation()
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth || {})

  // 인증 체크 중이면 대기
  if (loading) {
    return <Spinner fullPage text="로딩 중..." />
  }

  // 로그인 안 됨
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // 관리자 권한 필요한데 일반 유저
  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'ADMIN' && !user?.isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />
  }

  return children
}

export default ProtectedRoute

