import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Alert } from 'react-bootstrap'
import { loginUserThunk } from '../../../features/authSlice'
import { Input, Button, Checkbox, AlertModal } from '../../common'
import AuthFormLayout from '../AuthFormLayout'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import GoogleImg from '../../../assets/Google.png'
import 발바닥Img from '../../../assets/발바닥.png'
import './LoginForm.scss'

// API Base (구글 OAuth 리다이렉트용) - 런타임에 평가되도록 함수로 유지
const getApiUrl = () => {
   // 런타임 환경 변수 우선 확인 (server.js에서 주입)
   if (typeof window !== 'undefined' && window.__ENV__?.VITE_APP_API_URL) {
      const runtimeUrl = window.__ENV__.VITE_APP_API_URL
      if (runtimeUrl && 
          runtimeUrl !== 'undefined' && 
          typeof runtimeUrl === 'string' &&
          runtimeUrl.trim() !== '' &&
          runtimeUrl.startsWith('http')) {
         return runtimeUrl.replace(/\/$/, '')
      }
   }
   
   // 빌드 타임 환경 변수
   const buildTimeUrl = import.meta.env.VITE_APP_API_URL
   
   // undefined 문자열 체크 (빌드 타임에 undefined가 문자열로 주입되는 경우)
   if (buildTimeUrl && 
       buildTimeUrl !== 'undefined' && 
       buildTimeUrl !== undefined &&
       typeof buildTimeUrl === 'string' &&
       buildTimeUrl.trim() !== '' &&
       buildTimeUrl.startsWith('http')) {
      return buildTimeUrl.replace(/\/$/, '')
   }
   
   // 기본값
   return 'https://pethaul-api.onrender.com'
}

function LoginForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { alert, alertModal } = useModalHelpers()

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    id: '',
    password: '',
    saveIdToggle: false,
  })

  // 더블클릭 보호
  const submittedRef = useRef(false)
  const googleLoginLoadingRef = useRef(false)

  // 저장된 ID 불러오기
  useEffect(() => {
    const saveId = localStorage.getItem('savedUserId')
    if (saveId?.trim()) {
      setFormData((prev) => ({
        ...prev,
        id: saveId.trim(),
        saveIdToggle: true,
      }))
    }
  }, [])

  // 로그인 성공 시 이동
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      saveIdToggle: checked,
    }))
  }

  const handleGoogleLogin = () => {
    // 중복 클릭 방지
    if (googleLoginLoadingRef.current || loading) {
      return
    }

    googleLoginLoadingRef.current = true
    
    // 서버가 슬립 모드일 수 있으므로 사용자에게 알림
    alert('구글 로그인 페이지로 이동합니다. 잠시만 기다려 주세요.', '구글 로그인', 'info')
    
    // 리다이렉트 - 고정 URL 사용 (환경 변수 문제 방지)
    window.location.href = 'https://pethaul-api.onrender.com/auth/google'
    
    // 3초 후 리셋 (사용자가 뒤로 가기를 눌렀을 경우를 대비)
    setTimeout(() => {
      googleLoginLoadingRef.current = false
    }, 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submittedRef.current || loading) return

    // 기본 유효성 검사
    if (!formData.id.trim() || !formData.password.trim()) {
      alert('아이디와 비밀번호를 모두 입력하세요', '입력 필요', 'warning')
      return
    }

    // 아이디 저장
    if (formData.saveIdToggle) {
      localStorage.setItem('savedUserId', formData.id)
    } else {
      localStorage.removeItem('savedUserId')
    }

    submittedRef.current = true
    // 로그인 thunk 호출 (userId + password)
    dispatch(loginUserThunk({ userId: formData.id, password: formData.password }))
      .finally(() => {
        submittedRef.current = false
      })
  }

  return (
    <AuthFormLayout title="로그인" iconSrc={발바닥Img} formClassName="login-form">
      <form onSubmit={handleSubmit} noValidate>
        <div className="d-flex flex-column gap-4">
          <div className="d-flex flex-column gap-3">
            <div className="d-flex flex-column gap-2">
              <label className="form-label text-start" htmlFor="login-id">ID</label>
              <Input
                type="text"
                value={formData.id}
                onChange={(value) => handleInputChange('id', value)}
                placeholder="아이디를 입력하세요"
                id="login-id"
                name="id"
                autoComplete="username"
                className="w-100"
                variant="auth"
              />
            </div>

            <div className="d-flex flex-column gap-2">
              <label className="form-label text-start" htmlFor="login-password">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(value) => handleInputChange('password', value)}
                placeholder="비밀번호를 입력하세요"
                showPasswordToggle={true}
                id="login-password"
                name="password"
                autoComplete="current-password"
                className="w-100"
                variant="auth"
              />
            </div>

            <div className="d-flex align-items-center justify-content-between">
              <Checkbox
                checked={formData.saveIdToggle}
                onChange={handleCheckboxChange}
                label="아이디 저장"
                id="save-id"
                name="saveIdToggle"
              />
            </div>
          </div>

          {error && <Alert variant="danger" className="w-100 mb-0">{String(error)}</Alert>}
          {loading && <p className="text-center w-100 mb-0">로그인 중...</p>}

          <div className="find-section d-flex flex-wrap justify-content-center">
            <Link className="find-link" to="/find-id">아이디 찾기</Link>
            <Link className="find-link" to="/find-password">비밀번호 찾기</Link>
            <Link className="find-link" to="/join">회원가입</Link>
          </div>

          <div className="login-body__buttons d-flex flex-column gap-3">
            <Button
              variant="auth-primary"
              type="submit"
              size="lg"
              disabled={loading || submittedRef.current}
            >
              로그인
            </Button>

            <Button
              variant="auth-secondary"
              type="button"
              size="lg"
              onClick={handleGoogleLogin}
              disabled={loading || googleLoginLoadingRef.current}
            >
              <img src={GoogleImg} alt="google" />
              {googleLoginLoadingRef.current ? '이동 중...' : '구글 아이디로 로그인'}
            </Button>
          </div>
        </div>
      </form>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </AuthFormLayout>
  )
}

export default LoginForm

