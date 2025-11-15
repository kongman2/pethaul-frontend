import { useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import AppRouter from './routes/AppRouter'
import { checkUnifiedAuthThunk } from './features/authSlice'

function App() {
  const dispatch = useDispatch()
  const hasCheckedAuth = useRef(false)

  // 앱 시작 시 인증 상태 확인 (비블로킹, 백그라운드에서 실행)
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      // 인증 체크를 비동기로 실행하되, 앱 렌더링은 블로킹하지 않음
      dispatch(checkUnifiedAuthThunk()).catch(() => {
        // 인증 실패는 조용히 처리 (로그인 페이지에서 처리)
      })
    }
  }, [dispatch])

  // 인증 체크를 기다리지 않고 즉시 앱 렌더링 (ProtectedRoute에서 처리)
  return <AppRouter />
}

export default App
