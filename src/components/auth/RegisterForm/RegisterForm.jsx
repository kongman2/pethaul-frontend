import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { checkEmail, checkUsername } from '../../../api/authApi'
import { registerUserThunk } from '../../../features/authSlice'
import { formatPhoneNumber } from '../../../utils/phoneFormat'
import { Input, Button, Selector, AlertModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import AuthFormLayout from '../AuthFormLayout'
import 발바닥Img from '../../../assets/발바닥.png'

import './RegisterForm.scss'

function RegisterForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { alert, alertModal } = useModalHelpers()
  const postcodePromiseRef = useRef(null)
  const [form, setForm] = useState({
    userId: '',
    password: '',
    confirmPassword: '',
    name: '',
    address: '',
    addressDetail: '',
    phone: '',
    email: '',
    gender: '',
  })

  const [idChecking, setIdChecking] = useState(false)
  const [isIdAvailable, setIsIdAvailable] = useState(null)

  const [isChangedEmail, setIsChangedEmail] = useState(false)
  const [checkedEmail, setCheckedEmail] = useState(false)

  const buildAddressFromPostcode = (data) => {
    let fullAddress = data.address
    if (data.addressType === 'R') {
      const extras = []
      if (data.bname) extras.push(data.bname)
      if (data.buildingName) extras.push(data.buildingName)
      if (extras.length > 0) {
        fullAddress += ` (${extras.join(', ')})`
      }
    }
    return `[${data.zonecode}] ${fullAddress}`
  }

  const ensurePostcodeScript = () => {
    if (window.daum?.Postcode) {
      return Promise.resolve()
    }
    if (!postcodePromiseRef.current) {
      postcodePromiseRef.current = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
        script.onload = () => resolve()
        script.onerror = (error) => reject(error)
        document.body.appendChild(script)
      })
    }
    return postcodePromiseRef.current
  }

  const openAddressSearch = async () => {
    try {
      await ensurePostcodeScript()
      if (!window.daum?.Postcode) {
        throw new Error('Daum Postcode script unavailable')
      }
      new window.daum.Postcode({
        oncomplete: (data) => {
          const formattedAddress = buildAddressFromPostcode(data)
          setForm((prev) => ({
            ...prev,
            address: formattedAddress,
            addressDetail: '',
          }))
        },
      }).open()
    } catch (error) {
      alert('주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', '오류', 'warning')
    }
  }

  const handleInputChange = (name, value) => {
    let newValue = value

    if (name === 'phone') {
      newValue = formatPhoneNumber(value)
    }

    setForm((prev) => ({ ...prev, [name]: newValue }))

    if (name === 'userId') {
      setIsIdAvailable(null)
    }
    if (name === 'email') {
      setIsChangedEmail(true)
      setCheckedEmail(false)

      if (value.trim().length <= 0) {
        setIsChangedEmail(false)
        setCheckedEmail(true)
      }
    }
  }

  const handleIdCheck = async () => {
    const userId = form.userId.trim()
    if (!userId) {
      alert('아이디를 입력하세요', '입력 필요', 'warning')
      return
    }

    setIdChecking(true)
    try {
      const res = await checkUsername(userId)
      if (res.status === 200) {
        alert('사용 가능한 아이디입니다', '확인 완료', 'success')
        setIsIdAvailable(true)
      } else {
        alert('이미 사용 중인 아이디입니다', '중복 확인', 'warning')
        setIsIdAvailable(false)
      }
    } catch (error) {
      alert(`중복 확인 중 오류가 발생했습니다: ${error}`, '오류', 'danger')
      setIsIdAvailable(false)
    } finally {
      setIdChecking(false)
    }
  }

  const handleEmailCheck = async () => {
    try {
      const email = form.email.trim()
      if (!email) {
        setCheckedEmail(true)
        return
      }
      const res = await checkEmail(email)
      if (res.status === 200) {
        alert('사용 가능한 이메일입니다.', '확인 완료', 'success')
        setCheckedEmail(true)
        setIsChangedEmail(false)
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert('이미 사용 중인 이메일입니다.', '중복 확인', 'warning')
        setCheckedEmail(false)
      } else {
        alert(`중복 확인 중 오류가 발생했습니다: ${error}`, '오류', 'danger')
        setCheckedEmail(false)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isIdAvailable) {
      alert('아이디 중복 확인이 필요하거나, 이미 사용 중인 아이디입니다', '입력 필요', 'warning')
      return
    }

    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다', '입력 필요', 'warning')
      return
    }

    if (!checkedEmail || isChangedEmail) {
      alert('이메일 중복 확인이 필요하거나, 이미 사용 중인 이메일입니다.', '입력 필요', 'warning')
      return
    }

    if (!form.address.trim()) {
      alert('주소를 입력해주세요.', '입력 필요', 'warning')
      return
    }

    try {
      const payload = {
        userId: form.userId,
        password: form.password,
        name: form.name,
        address: form.address.trim(),
        addressDetail: form.addressDetail.trim(),
        phoneNumber: form.phone,
        email: form.email,
        gender: form.gender || null,
      }

      await dispatch(registerUserThunk(payload)).unwrap()
      alert('회원가입 성공!', '완료', 'success')
      navigate('/login')
    } catch (err) {
      alert(`회원가입 실패: ${err.message || err}`, '오류', 'danger')
    }
  }

  return (
    <AuthFormLayout
      title="회원가입"
      iconSrc={발바닥Img}
      formClassName="register-form"
      subtitle="필수 정보를 입력하고 중복 확인을 완료해주세요."
    >
      <form className="d-flex flex-column gap-4" onSubmit={handleSubmit} noValidate>
        <div className="d-flex flex-column gap-4 w-100">
          <div className="register-form__group d-flex flex-column gap-2">
            <label className="form-label" htmlFor="register-userId">ID</label>
            <Input
              type="text"
              name="userId"
              id="register-userId"
              value={form.userId}
              onChange={(value) => handleInputChange('userId', value)}
              placeholder="아이디를 입력해주세요."
              variant="auth"
              rightButton={{
                text: idChecking ? '확인 중...' : '중복확인',
                onClick: handleIdCheck,
                variant: 'outline',
                size: 'sm',
                disabled: idChecking,
              }}
              required
            />
            {isIdAvailable === true && (
              <p className="register-form__feedback text-success small mb-0">사용 가능한 아이디입니다.</p>
            )}
            {isIdAvailable === false && (
              <p className="register-form__feedback text-danger small mb-0">이미 사용 중인 아이디입니다.</p>
            )}
          </div>

          <div className="register-form__group d-flex flex-column gap-2">
            <label className="form-label" htmlFor="register-password">Password</label>
            <Input
              type="password"
              name="password"
              id="register-password"
              value={form.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="비밀번호를 입력하세요."
              showPasswordToggle={true}
              variant="auth"
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              id="register-confirmPassword"
              value={form.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              placeholder="비밀번호를 다시 입력해주세요."
              showPasswordToggle={true}
              variant="auth"
              required
            />
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <div className="register-form__group">
                <label className="form-label" htmlFor="register-name">이름</label>
                <Input
                  type="text"
                  name="name"
                  id="register-name"
                  value={form.name}
                  onChange={(value) => handleInputChange('name', value)}
                  placeholder="이름을 입력하세요."
                  variant="auth"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="register-form__group">
                <label className="form-label" htmlFor="register-phone">전화번호</label>
                <Input
                  type="tel"
                  name="phone"
                  id="register-phone"
                  value={form.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="010-1234-5678"
                  variant="auth"
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-form__group">
            <label className="form-label" htmlFor="register-email">이메일 (선택)</label>
            <Input
              type="email"
              name="email"
              id="register-email"
              value={form.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="abc1234@gmail.com"
              variant="auth"
              rightButton={{
                text: checkedEmail ? '확인됨' : '중복확인',
                onClick: handleEmailCheck,
                variant: 'outline',
                size: 'sm',
              }}
            />
          </div>

          <div className="register-form__group">
            <label className="form-label" htmlFor="register-address">주소</label>
            <Input
              type="text"
              name="address"
              id="register-address"
              value={form.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="주소를 입력해주세요."
              variant="auth"
              rightButton={{
                text: '검색',
                onClick: openAddressSearch,
                variant: 'outline',
                size: 'sm',
              }}
              required
            />
          </div>

          <div className="register-form__group">
            <label className="form-label" htmlFor="register-address-detail">상세 주소</label>
            <Input
              type="text"
              name="addressDetail"
              id="register-address-detail"
              value={form.addressDetail}
              onChange={(value) => handleInputChange('addressDetail', value)}
              placeholder="동/호수 등 상세 주소를 입력하세요."
              variant="auth"
            />
          </div>

          <div className="register-form__group">
            <label className="form-label" htmlFor="register-gender">성별 (선택)</label>
            <Selector
              id="register-gender"
              name="gender"
              value={form.gender}
              onChange={(value) => handleInputChange('gender', value)}
              placeholder="선택 안 함"
              className="register-form__selector"
              variant="auth"
              options={[
                { value: '', label: '선택 안 함' },
                { value: 'M', label: '남성' },
                { value: 'F', label: '여성' },
              ]}
            />
          </div>
        </div>

        <div className="mt-4">
          <Button type="submit" variant="auth-primary" size="lg">
            회원가입
          </Button>
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

export default RegisterForm
