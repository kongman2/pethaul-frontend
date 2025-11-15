import { useDispatch, useSelector } from 'react-redux'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { updateMyInfoThunk, checkUnifiedAuthThunk } from '../../features/authSlice'
import { checkEmail } from '../../api/authApi'

import { formatPhoneNumber } from '../../utils/phoneFormat'
import { SectionCard, Input, Button, Spinner, PageHeader, Textarea, Selector, AlertModal, ImageUpload } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'
import { uploadAvatar } from '../../api/authApi'
import { getProfileImage, buildImageUrl } from '../../utils/imageUtils'

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

// 구글 사용자 확인 함수
const isSocialUser = (user, googleAuthenticated) => {
  if (!user) return false
  const provider = user?.provider
  const hasSocialMarkers = Boolean(user?.snsId || user?.socialId || user?.loginType)
  const isNonLocal = provider && String(provider).toLowerCase() !== 'local'
  return googleAuthenticated || isNonLocal || hasSocialMarkers
}

function EditMyInfoPage() {
  useAppBackground('app-bg--blue')
  const dispatch = useDispatch()
  const { alert, alertModal } = useModalHelpers()
  const { user, loading, error, googleAuthenticated } = useSelector((s) => s.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const verified = location.state?.verified === true
  const uploadAvatarFromProfile = location.state?.uploadAvatar === true
  const avatarFileFromProfile = location.state?.avatarFile

  // 구글 사용자는 비밀번호 확인 건너뛰기
  const socialUser = isSocialUser(user, googleAuthenticated)

  const openedRef = useRef(false)
  useEffect(() => {
    // 구글 사용자는 비밀번호 확인 없이 바로 접근 가능
    if (socialUser) {
      return
    }
    
    if (!verified && !openedRef.current) {
      openedRef.current = true
      // 현재 위치를 배경으로 넘기면서 모달 오픈
      navigate('/verify', { state: { backgroundLocation: location }, replace: true })
    }
  }, [verified, location, navigate, socialUser])

  const initialPhone = useMemo(() => (user?.phoneNumber ? String(user.phoneNumber).replace(/\D/g, '') : ''), [user?.phoneNumber])

  const { address: initialMainAddress, detail: initialMainDetail } = normalizeAddressParts(
    user?.address ?? '',
    user?.addressDetail ?? ''
  )
  const { address: initialDefaultAddressValue, detail: initialDefaultAddressDetailValue } = normalizeAddressParts(
    user?.defaultDeliveryAddress ?? '',
    user?.defaultDeliveryAddressDetail ?? ''
  )

  // 초기값 설정: 구글 사용자는 구글에서 가져온 정보만 표시, 나머지는 빈 값
  const [inputName, setInputName] = useState(socialUser ? (user?.name || '') : (user?.name ?? ''))
  const [inputEmail, setInputEmail] = useState(socialUser ? (user?.email || '') : (user?.email ?? ''))
  const [phoneNumber, setPhoneNumber] = useState(socialUser ? '' : initialPhone)
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

  // 프로필 이미지 관련 상태
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

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
    // 구글 사용자: 구글에서 가져온 기본 정보(이름, 이메일)만 표시, 나머지는 빈 값
    // 로컬 사용자: 기존 값 사용
    if (socialUser) {
      // 구글 사용자는 이름과 이메일만 구글에서 가져온 값 사용
      // 전화번호, 주소 등은 사용자가 직접 입력한 경우에만 표시
      setInputName(user?.name || '')
      setInputEmail(user?.email || '')
      // 전화번호는 사용자가 이전에 입력한 경우에만 표시
      setPhoneNumber(user?.phoneNumber ? String(user.phoneNumber).replace(/\D/g, '') : '')
      
      // 주소는 사용자가 이전에 입력한 경우에만 표시
      const { address: normalizedMainAddress, detail: normalizedMainDetail } = normalizeAddressParts(
        user?.address ?? '',
        user?.addressDetail ?? ''
      )
      // 주소가 비어있지 않을 때만 설정 (사용자가 입력한 경우)
      if (normalizedMainAddress || normalizedMainDetail) {
        setInputAddress(normalizedMainAddress)
        setInputAddressDetail(normalizedMainDetail)
      } else {
        // 주소가 없으면 빈 값으로 설정
        setInputAddress('')
        setInputAddressDetail('')
      }
    } else {
      // 로컬 사용자: 기존 값 사용
    setInputName(user?.name ?? '')
    setInputEmail(user?.email ?? '')
    setPhoneNumber(user?.phoneNumber ? String(user.phoneNumber).replace(/\D/g, '') : '')

    const { address: normalizedMainAddress, detail: normalizedMainDetail } = normalizeAddressParts(
      user?.address ?? '',
      user?.addressDetail ?? ''
    )
    setInputAddress(normalizedMainAddress)
    setInputAddressDetail(normalizedMainDetail)
    }

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
    
    // 프로필 이미지 초기화
    const currentAvatar = user?.avatar || user?.picture
    if (currentAvatar) {
      setAvatarPreview(buildImageUrl(currentAvatar))
    } else {
      setAvatarPreview(null)
    }
    setAvatarFile(null)
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
    user?.avatar,
    user?.picture,
  ])

  // Profile 컴포넌트에서 전달받은 파일 처리
  useEffect(() => {
    if (uploadAvatarFromProfile && avatarFileFromProfile) {
      const file = avatarFileFromProfile
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result)
      }
      reader.readAsDataURL(file)
      // state 초기화
      navigate(location.pathname, { replace: true, state: { verified } })
    }
  }, [uploadAvatarFromProfile, avatarFileFromProfile, navigate, location.pathname, verified])

  const handleAvatarChange = (files) => {
    if (files && files.length > 0) {
      const file = files[0]
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarRemove = () => {
    setAvatarFile(null)
    const currentAvatar = user?.avatar || user?.picture
    if (currentAvatar) {
      setAvatarPreview(buildImageUrl(currentAvatar))
    } else {
      setAvatarPreview(null)
    }
  }

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

    try {
      setSubmitting(true)

      // 프로필 이미지 업로드 (파일이 있는 경우)
      if (avatarFile) {
        try {
          setUploadingAvatar(true)
          const avatarResponse = await uploadAvatar(avatarFile)
          // 업로드 성공 후 사용자 정보 다시 가져오기
          if (avatarResponse?.data?.avatar) {
            // Redux store에 avatar 업데이트
            await dispatch(updateMyInfoThunk({ avatar: avatarResponse.data.avatar })).unwrap()
            // 사용자 정보 다시 가져오기 (서버에서 최신 정보 반영)
            await dispatch(checkUnifiedAuthThunk()).unwrap()
          }
        } catch (avatarError) {
          alert('프로필 이미지 업로드 중 오류가 발생했습니다.', '오류', 'danger')
          setUploadingAvatar(false)
          setSubmitting(false)
          return
        } finally {
          setUploadingAvatar(false)
        }
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
    <>
      <section className="container py-5">
        <PageHeader title="회원정보변경" onBack={() => navigate(-1)} className="mb-4" />

        <SectionCard title="회원정보를 다시 입력해주세요." headerActions={null} className="section-card--overflow-visible">
          <form className="d-flex flex-column gap-4 p-4" onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* 프로필 이미지 업로드 */}
              <div className="col-12">
                <ImageUpload
                  label="프로필 이미지"
                  id="profile-avatar"
                  multiple={false}
                  previewUrls={avatarPreview ? [avatarPreview] : []}
                  onChange={handleAvatarChange}
                  onRemove={handleAvatarRemove}
                  uploading={uploadingAvatar}
                  hint="jpg, png, webp, gif 형식의 이미지를 업로드해주세요. (최대 5MB)"
                />
              </div>

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
    </>
  )
}
export default EditMyInfoPage
