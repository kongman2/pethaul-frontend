import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AppRouter from './routes/AppRouter'
import { checkUnifiedAuthThunk } from './features/authSlice'
import { Spinner } from './components/common'

function App() {
  const dispatch = useDispatch()
  const { loading } = useSelector((state) => state.auth || {})
  const hasCheckedAuth = useRef(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // 앱 시작 시 인증 상태 확인 (한 번만 실행)
  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true
      dispatch(checkUnifiedAuthThunk())
        .finally(() => {
          setIsInitializing(false)
        })
    }
  }, [dispatch])

  // 초기 인증 체크가 완료될 때까지 대기
  if (isInitializing || loading) {
    return <Spinner fullPage text="로딩 중..." />
  }

   return <AppRouter />
}

export default App
