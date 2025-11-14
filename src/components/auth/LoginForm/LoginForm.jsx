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

// API Base (구글 OAuth 리다이렉트용)
const API = (`${import.meta.env.VITE_APP_API_URL}` || '').replace(/\/$/, '')

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
              onClick={() => { window.location.href = `${API}/auth/google` }}
              disabled={loading}
            >
              <img src={GoogleImg} alt="google" />
              구글 아이디로 로그인
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

