import { useDispatch, useSelector } from 'react-redux'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { updateMyInfoThunk } from '../../features/authSlice'
import { checkEmail } from '../../api/authApi'

import { formatPhoneNumber } from '../../utils/phoneFormat'
import { SectionCard, Input, Button, Spinner, PageHeader, Textarea, Selector, AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'

const REQUEST_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '문 앞에 두고 가주세요', label: '문 앞에 두고 가주세요' },
  { value: '배송 전 연락주세요', label: '배송 전 연락주세요' },
  { value: '부재 시 경비실에 맡겨주세요', label: '부재 시 경비실에 맡겨주세요' },
  { value: 'OTHER', label: '기타 요청사항 (직접 입력)' },
]

const isPresetRequest = (value) => {
  if (!value) return true
  return REQUEST_OPTIONS.some((option) => option.value && option.value !== 'OTHER' && option.value === value)
}

const normalizeAddressParts = (address = '', detail = '') => {
  const trimmedAddress = (address || '').trim()
  const trimmedDetail = (detail || '').trim()

  if (trimmedDetail) {
    return { address: trimmedAddress, detail: trimmedDetail }
  }

  if (!trimmedAddress) {
    return { address: '', detail: '' }
  }

  const match = trimmedAddress.match(/^(\[[0-9]{5}\]\s*[^\(]+(?:\([^)]+\))?)(.*)$/)
  if (match) {
    const remainder = (match[2] || '').trim()
    if (remainder) {
      return {
        address: match[1].trim(),
        detail: remainder,
      }
    }
    return {
      address: match[1].trim(),
      detail: '',
    }
  }

  return { address: trimmedAddress, detail: '' }
}

function EditMyInfoPage() {
  useAppBackground('app-bg--blue')
  const dispatch = useDispatch()
  const { alert, alertModal } = useModalHelpers()
  const { user, loading, error } = useSelector((s) => s.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const verified = location.state?.verified === true

  const openedRef = useRef(false)
  useEffect(() => {
    if (!verified && !openedRef.current) {
      openedRef.current = true
      // 현재 위치를 배경으로 넘기면서 모달 오픈
      navigate('/verify', { state: { backgroundLocation: location }, replace: true })
    }
  }, [verified, location, navigate])

  const initialPhone = useMemo(() => (user?.phoneNumber ? String(user.phoneNumber).replace(/\D/g, '') : ''), [user?.phoneNumber])

  const { address: initialMainAddress, detail: initialMainDetail } = normalizeAddressParts(
    user?.address ?? '',
    user?.addressDetail ?? ''
  )
  const { address: initialDefaultAddressValue, detail: initialDefaultAddressDetailValue } = normalizeAddressParts(
    user?.defaultDeliveryAddress ?? '',
    user?.defaultDeliveryAddressDetail ?? ''
  )

  const [inputName, setInputName] = useState(user?.name ?? '')
  const [inputEmail, setInputEmail] = useState(user?.email ?? '')
  const [phoneNumber, setPhoneNumber] = useState(initialPhone)
  const [newPassword, setNewPassword] = useState('')
  const [checkNewPassword, setCheckNewPassword] = useState('')
  const [inputAddress, setInputAddress] = useState(initialMainAddress)
  const [inputAddressDetail, setInputAddressDetail] = useState(initialMainDetail)
  const [isChangedEmail, setIsChangedEmail] = useState(false)
  const [checkedEmail, setCheckedEmail] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [defaultDeliveryName, setDefaultDeliveryName] = useState(user?.defaultDeliveryName ?? '')
  const [defaultDeliveryPhone, setDefaultDeliveryPhone] = useState(
    user?.defaultDeliveryPhone ? String(user.defaultDeliveryPhone).replace(/\D/g, '') : ''
  )
  const [defaultDeliveryAddress, setDefaultDeliveryAddress] = useState(initialDefaultAddressValue)
  const [defaultDeliveryAddressDetail, setDefaultDeliveryAddressDetail] = useState(initialDefaultAddressDetailValue)
  const initialDefaultRequest = (user?.defaultDeliveryRequest ?? '').trim()
  const [defaultRequestOption, setDefaultRequestOption] = useState(
    isPresetRequest(initialDefaultRequest)
      ? initialDefaultRequest
      : initialDefaultRequest
        ? 'OTHER'
        : ''
  )
  const [defaultRequestCustom, setDefaultRequestCustom] = useState(
    !isPresetRequest(initialDefaultRequest) ? initialDefaultRequest : ''
  )

  const postcodePromiseRef = useRef(null)

  const handleChangeEmail = (next) => {
    setInputEmail(next)
    setIsChangedEmail(true)
    setCheckedEmail(false)
  }

  const handleCheckEmail = async () => {
    const trimmed = inputEmail.trim()
    if (!trimmed) {
      alert('확인할 이메일을 입력해주세요.', '입력 필요', 'warning')
      return
    }

    try {
      await checkEmail(trimmed)
      alert('사용 가능한 이메일입니다.', '확인 완료', 'success')
      setCheckedEmail(true)
      setIsChangedEmail(false)
      setInputEmail(trimmed)
    } catch (error) {
      if (error?.status === 409) {
        alert('이미 사용 중인 이메일입니다.', '중복 확인', 'warning')
      } else {
        alert('이메일 중복 확인 중 오류가 발생했습니다.', '오류', 'danger')
      }
      setCheckedEmail(false)
      setIsChangedEmail(true)
    }
  }

  const handlePhoneChange = (value) => {
    setPhoneNumber(value.replace(/\D/g, ''))
  }

  const handleDefaultPhoneChange = (value) => {
    setDefaultDeliveryPhone(value.replace(/\D/g, ''))
  }

  const handleDefaultRequestOptionChange = (value) => {
    setDefaultRequestOption(value)
    if (value !== 'OTHER') {
      setDefaultRequestCustom('')
    }
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

  const openAddressSearch = async (target) => {
    try {
      await ensurePostcodeScript()
      if (!window.daum?.Postcode) {
        throw new Error('Daum Postcode script not available')
      }

      new window.daum.Postcode({
        oncomplete: (data) => {
          const formattedAddress = buildAddressFromPostcode(data)
          if (target === 'main') {
            setInputAddress(formattedAddress)
            setInputAddressDetail('')
          } else if (target === 'default') {
            setDefaultDeliveryAddress(formattedAddress)
            setDefaultDeliveryAddressDetail('')
          }
        },
      }).open()
    } catch (error) {
      alert('주소 검색 서비스를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.', '오류', 'warning')
    }
  }

  useEffect(() => {
    setInputName(user?.name ?? '')
    setInputEmail(user?.email ?? '')
    setPhoneNumber(user?.phoneNumber ? String(user.phoneNumber).replace(/\D/g, '') : '')

    const { address: normalizedMainAddress, detail: normalizedMainDetail } = normalizeAddressParts(
      user?.address ?? '',
      user?.addressDetail ?? ''
    )
    setInputAddress(normalizedMainAddress)
    setInputAddressDetail(normalizedMainDetail)

    setDefaultDeliveryName(user?.defaultDeliveryName ?? '')
    setDefaultDeliveryPhone(user?.defaultDeliveryPhone ? String(user.defaultDeliveryPhone).replace(/\D/g, '') : '')

    const { address: normalizedDefaultAddress, detail: normalizedDefaultDetail } = normalizeAddressParts(
      user?.defaultDeliveryAddress ?? '',
      user?.defaultDeliveryAddressDetail ?? ''
    )
    setDefaultDeliveryAddress(normalizedDefaultAddress)
    setDefaultDeliveryAddressDetail(normalizedDefaultDetail)

    const normalizedRequest = (user?.defaultDeliveryRequest ?? '').trim()
    if (isPresetRequest(normalizedRequest)) {
      setDefaultRequestOption(normalizedRequest)
      setDefaultRequestCustom('')
    } else if (normalizedRequest) {
      setDefaultRequestOption('OTHER')
      setDefaultRequestCustom(normalizedRequest)
    } else {
      setDefaultRequestOption('')
      setDefaultRequestCustom('')
    }
    setIsChangedEmail(false)
    setCheckedEmail(false)
    setNewPassword('')
    setCheckNewPassword('')
  }, [
    user?.name,
    user?.email,
    user?.phoneNumber,
    user?.address,
    user?.addressDetail,
    user?.defaultDeliveryName,
    user?.defaultDeliveryPhone,
    user?.defaultDeliveryAddress,
    user?.defaultDeliveryAddressDetail,
    user?.defaultDeliveryRequest,
  ])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isChangedEmail && !checkedEmail) {
      alert('이메일 중복 확인이 필요합니다.', '입력 필요', 'warning')
      return
    }

    if (newPassword) {
      if (!checkNewPassword) {
        alert('비밀번호 확인이 필요합니다.', '입력 필요', 'warning')
        return
      }
      if (newPassword !== checkNewPassword) {
        alert('새 비밀번호와 비밀번호 확인 값이 일치하지 않습니다.', '입력 필요', 'warning')
        return
      }
    }

    const cleanedPhone = phoneNumber ? phoneNumber.replace(/-/g, '') : ''
    const cleanedDefaultPhone = defaultDeliveryPhone ? defaultDeliveryPhone.replace(/-/g, '') : ''
    const resolvedDefaultRequest =
      defaultRequestOption === 'OTHER' ? defaultRequestCustom.trim() : defaultRequestOption

    if (!inputAddress.trim()) {
      alert('주소를 입력해주세요.', '입력 필요', 'warning')
      return
    }

    if (defaultRequestOption === 'OTHER' && !defaultRequestCustom.trim()) {
      alert('기타 요청사항을 입력해주세요.', '입력 필요', 'warning')
      return
    }

    const payload = {
      name: inputName,
      email: inputEmail,
      phoneNumber: cleanedPhone,
      address: inputAddress.trim(),
      addressDetail: inputAddressDetail.trim(),
      ...(newPassword ? { newPassword } : {}),
      defaultDeliveryName: defaultDeliveryName.trim(),
      defaultDeliveryPhone: cleanedDefaultPhone,
      defaultDeliveryAddress: defaultDeliveryAddress.trim(),
      defaultDeliveryAddressDetail: defaultDeliveryAddressDetail.trim(),
      defaultDeliveryRequest: resolvedDefaultRequest || '',
    }

    try {
      setSubmitting(true)
      await dispatch(updateMyInfoThunk(payload)).unwrap()
      alert('회원 정보를 성공적으로 수정했습니다.', '완료', 'success')
      navigate('/mypage')
    } catch (error) {
      alert('회원 정보 수정 중 오류가 발생했습니다.', '오류', 'danger')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner fullPage text="사용자 정보를 불러오는 중..." />
  if (error) return <p>에러 발생: {String(error)}</p>
  if (!user) return null

  return (
      <section className="container py-5">
        <PageHeader title="회원정보변경" onBack={() => navigate(-1)} className="mb-4" />

        <SectionCard title="회원정보를 다시 입력해주세요." headerActions={null} className="section-card--overflow-visible">
          <form className="d-flex flex-column gap-4 p-4" onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label htmlFor="myinfo-id" className="form-label fw-semibold">
                  ID
                </label>
                <Input id="myinfo-id" name="id" value={user?.userId ?? ''} className="w-100" disabled />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="myinfo-name" className="form-label fw-semibold">
                  이름
                </label>
                <Input
                  id="myinfo-name"
                  name="name"
                  placeholder="이름을 입력하세요"
                  value={inputName}
                  onChange={setInputName}
                  required
                  className="w-100"
                />
              </div>

              <div className="col-12">
                <label htmlFor="myinfo-email" className="form-label fw-semibold">
                  E-mail
                </label>
                <Input
                  id="myinfo-email"
                  name="email"
                  type="email"
                  placeholder="example@pethaul.com"
                  value={inputEmail}
                  onChange={handleChangeEmail}
                  rightButton={{
                    text: '중복 확인',
                    onClick: handleCheckEmail,
                    variant: 'outline',
                    size: 'sm',
                    disabled: !isChangedEmail,
                  }}
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="myinfo-phone" className="form-label fw-semibold">
                  전화번호
                </label>
                <Input
                  id="myinfo-phone"
                  name="phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  value={formatPhoneNumber(phoneNumber)}
                  onChange={handlePhoneChange}
                  className="w-100"
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="myinfo-address" className="form-label fw-semibold">
                  주소
                </label>
                <Input
                  id="myinfo-address"
                  name="address"
                  placeholder="주소를 입력하세요"
                  value={inputAddress}
                  onChange={setInputAddress}
                  className="w-100"
                  rightButton={{
                    text: '검색',
                    onClick: () => openAddressSearch('main'),
                    variant: 'outline',
                    size: 'sm',
                  }}
                />
              </div>

              <div className="col-12 col-md-6">
                <Input
                  label="상세 주소"
                  id="myinfo-address-detail"
                  name="addressDetail"
                  placeholder="동/호수 등 상세 주소"
                  value={inputAddressDetail}
                  onChange={setInputAddressDetail}
                  className="w-100"
                />
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold" htmlFor="myinfo-password">
                  비밀번호 변경하기 (선택)
                </label>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <Input
                      id="myinfo-password"
                      name="new-password"
                      type="password"
                      placeholder="변경할 비밀번호를 입력하세요"
                      value={newPassword}
                      onChange={setNewPassword}
                      showPasswordToggle
                      className="w-100"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <Input
                      id="myinfo-password-confirm"
                      name="check-new-password"
                      type="password"
                      placeholder="변경할 비밀번호를 한 번 더 입력하세요"
                      value={checkNewPassword}
                      onChange={setCheckNewPassword}
                      showPasswordToggle
                      className="w-100"
                    />
                  </div>
                </div>
                {newPassword && checkNewPassword && newPassword !== checkNewPassword && (
                  <p className="text-danger small mt-2 mb-0">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>

          <div className="col-12">
            <div className="border-top pt-3 mt-2">
              <p className="fw-semibold mb-1">기본 배송지 정보</p>
              <p className="text-muted small mb-0">주문 시 자동으로 불러올 배송지 정보를 저장해두세요.</p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="수령인 이름"
              id="myinfo-default-name"
              name="defaultDeliveryName"
              placeholder="예: 홍길동"
              value={defaultDeliveryName}
              onChange={setDefaultDeliveryName}
            />
          </div>

          <div className="col-12 col-md-6">
            <Input
              label="수령인 연락처"
              id="myinfo-default-phone"
              name="defaultDeliveryPhone"
              type="tel"
              placeholder="010-0000-0000"
              value={formatPhoneNumber(defaultDeliveryPhone)}
              onChange={handleDefaultPhoneChange}
            />
          </div>

          <div className="col-12">
            <Input
              label="배송지 주소"
              id="myinfo-default-address"
              name="defaultDeliveryAddress"
              placeholder="기본 배송지 주소를 입력하세요"
              value={defaultDeliveryAddress}
              onChange={setDefaultDeliveryAddress}
              rightButton={{
                text: '검색',
                onClick: () => openAddressSearch('default'),
                variant: 'outline',
                size: 'sm',
              }}
            />
          </div>

          <div className="col-12">
            <Input
              label="상세 주소"
              id="myinfo-default-address-detail"
              name="defaultDeliveryAddressDetail"
              placeholder="동/호수 등 상세 주소"
              value={defaultDeliveryAddressDetail}
              onChange={setDefaultDeliveryAddressDetail}
            />
          </div>

          <div className="col-12 col-md-6">
            <Selector
              label="배송 요청 사항"
              id="myinfo-default-request"
              name="defaultDeliveryRequest"
              value={defaultRequestOption}
              onChange={handleDefaultRequestOptionChange}
              options={REQUEST_OPTIONS}
              placeholder="요청 사항 선택"
            />
          </div>

          {defaultRequestOption === 'OTHER' && (
            <div className="col-12">
              <Textarea
                label="기타 요청사항"
                id="myinfo-default-request-custom"
                name="defaultDeliveryRequestCustom"
                placeholder="부재 시 문 앞에 놓아주세요 등 요청 사항을 입력하세요"
                value={defaultRequestCustom}
                onChange={setDefaultRequestCustom}
                rows={3}
              />
            </div>
          )}
            </div>

            <div className="d-flex justify-content-end">
              <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                {submitting ? '처리 중…' : '수정하기'}
              </Button>
            </div>
          </form>
        </SectionCard>
      </section>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
  )
}
export default EditMyInfoPage
