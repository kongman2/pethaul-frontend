import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { Icon } from '@iconify/react'

import tosspayImg from '../../assets/tosspay.png'
import naverpayImg from '../../assets/naverpay.png'
import applepayImg from '../../assets/applepay.png'
import kakaopayImg from '../../assets/kakaopay.png'

import { Button, Input, SectionCard, Textarea, Selector, Spinner, PageHeader, AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import CouponModal from '../../components/order/CouponModal/CouponModal'
import useAppBackground from '../../hooks/useAppBackground'

import './OrderPage.scss'

const API_BASE = import.meta.env.VITE_APP_API_URL || ''

const REQUEST_OPTIONS = [
  { value: '', label: '선택 안 함' },
  { value: '문 앞에 두고 가주세요', label: '문 앞에 두고 가주세요' },
  { value: '배송 전 연락주세요', label: '배송 전 연락주세요' },
  { value: '부재 시 경비실에 맡겨주세요', label: '부재 시 경비실에 맡겨주세요' },
  { value: 'OTHER', label: '기타 요청사항 (직접 입력)' },
]

const PAYMENT_METHODS = ['간편결제', '카드결제', '현금결제', '휴대폰결제']

const SIMPLE_PAY_OPTIONS = [
  { label: '토스페이', value: '토스페이', img: tosspayImg },
  { label: '네이버페이', value: '네이버페이', img: naverpayImg },
  { label: '애플페이', value: '애플페이', img: applepayImg },
  { label: '카카오페이', value: '카카오페이', img: kakaopayImg },
]

const CASH_METHOD_OPTIONS = ['무통장입금', '편의점결제']

const formatPhoneDisplay = (value) => {
  if (!value) return ''
  const digits = String(value).replace(/[^0-9]/g, '')
  if (!digits) return ''
  const formatted = digits.replace(/(^02|^0505|^1\d{3}|^0\d{2})(\d+)?(\d{4})$/, '$1-$2-$3').replace('--', '-')
  return formatted.length > 13 ? formatted.slice(0, 13) : formatted
}

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

function OrderPage() {
  useAppBackground('app-bg--blue')
  const { alert, alertModal } = useModalHelpers()
  const navigate = useNavigate()
  const location = useLocation()

  const incomingItem = location.state?.item
  const incomingCartItems = location.state?.cartItems
  const incomingOrder = location.state?.order

  const reduxCartItems = useSelector((state) => state.cart?.items || [])

  const toNumber = (value, fallback = 0) => {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  const pickPrice = (item) =>
    toNumber(
      item?.price ??
        item?.Item?.price ??
        item?.unitPrice ??
        item?.salePrice ??
        item?.originPrice,
      0,
    )

  const pickQty = (item) =>
    toNumber(item?.quantity ?? item?.count ?? item?.qty ?? item?.amount ?? 1, 1)

  const pickItemId = (item) =>
    item?.itemId ?? item?.ItemId ?? item?.id ?? item?.Item?.id

  const cartArr = Array.isArray(incomingCartItems) ? incomingCartItems : []
  const itemArr = Array.isArray(incomingItem)
    ? incomingItem
    : incomingItem
    ? [incomingItem]
    : []
  const orderArr = Array.isArray(incomingOrder?.items)
    ? incomingOrder.items
    : []
  const stateArr = Array.isArray(location.state?.items)
    ? location.state.items
    : Array.isArray(location.state?.cartItems)
    ? location.state.cartItems
    : location.state?.item
    ? [location.state.item]
    : []

  const rawItems = useMemo(() => {
    if (cartArr.length) return cartArr
    if (itemArr.length) return itemArr
    if (orderArr.length) return orderArr
    if (stateArr.length) return stateArr
    if (Array.isArray(reduxCartItems)) return reduxCartItems
    return []
  }, [cartArr, itemArr, orderArr, stateArr, reduxCartItems])

  const orderPrice = useMemo(
    () => rawItems.reduce((sum, item) => sum + pickPrice(item) * pickQty(item), 0),
    [rawItems],
  )

  const totalCount = useMemo(
    () => rawItems.reduce((sum, item) => sum + pickQty(item), 0),
    [rawItems],
  )

  const allowStack = false
  const COUPONS = [
    { code: 'WELCOME20', name: '신규가입 20% 쿠폰', type: 'percent', value: 20 },
    { code: 'SAVE5000', name: '5,000원 즉시할인', type: 'fixed', value: 5000 },
  ]

  const [couponModalOpen, setCouponModalOpen] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('간편결제')
  const [simplePay, setSimplePay] = useState('')
  const [selectedCashMethod, setSelectedCashMethod] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    request: '',
    memo: '',
  })
  const [customRequest, setCustomRequest] = useState('')
  const defaultDeliveryRef = useRef({
    name: '',
    phone: '',
    address: '',
    request: '',
    addressDetail: '',
  })
  const postcodePromiseRef = useRef(null)

  const [cardNumber, setCardNumber] = useState({
    card0: '',
    card1: '',
    card2: '',
    card3: '',
  })

  const [expiry, setExpiry] = useState({
    expiryMonth: '',
    expiryYear: '',
  })

  const calcDiscountByCoupon = (subtotal, coupon) => {
    if (!coupon) return 0
    if (coupon.type === 'percent') return Math.floor(subtotal * (coupon.value / 100))
    if (coupon.type === 'fixed') return Math.min(subtotal, coupon.value)
    return 0
  }

  const discount = calcDiscountByCoupon(orderPrice, selectedCoupon)
  const afterDiscount = Math.max(0, orderPrice - discount)
  const hasShippingFree = selectedCoupon?.type === 'shippingFree'
  const shippingFee =
    hasShippingFree || afterDiscount === 0
      ? 0
      : afterDiscount >= 30000
      ? 0
      : 3000
  const payable = afterDiscount + shippingFee

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
          setFormData((prev) => ({
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

  const loadDefaultDelivery = () => {
    const defaults = defaultDeliveryRef.current
    if (defaults && (defaults.name || defaults.address || defaults.phone || defaults.request)) {
      setFormData((prev) => ({
        ...prev,
        name: defaults.name || '',
        phone: defaults.phone || '',
        address: defaults.address || '',
        addressDetail: defaults.addressDetail || '',
        request: isPresetRequest(defaults.request) ? defaults.request : defaults.request ? 'OTHER' : '',
        memo: '',
      }))
      setCustomRequest(isPresetRequest(defaults.request) ? '' : defaults.request || '')
    } else {
      setFormData((prev) => ({
        ...prev,
        name: '',
        phone: '',
        address: '',
        addressDetail: '',
        request: '',
        memo: '',
      }))
      setCustomRequest('')
    }
  }

  const clearDelivery = () => {
    setFormData((prev) => ({
      ...prev,
      name: '',
      phone: '',
      address: '',
      addressDetail: '',
      request: '',
      memo: '',
    }))
    setCustomRequest('')
  }

  const hydrateFromUser = (user) => {
    if (!user) return

    const defaultName = (user.defaultDeliveryName ?? '').trim() || user.name || ''
    const rawDefaultAddress = (user.defaultDeliveryAddress ?? '').trim()
    const rawDefaultAddressDetail = (user.defaultDeliveryAddressDetail ?? '').trim()
    const rawUserAddress = (user.address ?? '').trim()
    const rawUserAddressDetail = (user.addressDetail ?? '').trim()
    const defaultPhone = formatPhoneDisplay(user.defaultDeliveryPhone || user.phoneNumber || '')
    const defaultRequest = (user.defaultDeliveryRequest ?? '').trim()

    const useDefault = !!rawDefaultAddress
    const { address: normalizedAddress, detail: normalizedDetail } = normalizeAddressParts(
      useDefault ? rawDefaultAddress : rawUserAddress,
      useDefault ? rawDefaultAddressDetail : rawUserAddressDetail
    )

    defaultDeliveryRef.current = {
      name: defaultName,
      address: normalizedAddress,
      phone: defaultPhone,
      request: defaultRequest,
      addressDetail: normalizedDetail,
    }

    let shouldUpdateCustom = false
    let customValue = ''

    setFormData((prev) => {
      const next = {
        ...prev,
        name: prev.name || defaultName,
        address: prev.address || normalizedAddress,
        addressDetail: prev.addressDetail || normalizedDetail,
        phone: prev.phone || defaultPhone,
        request: prev.request,
      }

      if (!prev.address) {
        next.addressDetail = normalizedDetail
      }

      if (!prev.request || (prev.request === 'OTHER' && !customRequest)) {
        if (defaultRequest) {
          if (isPresetRequest(defaultRequest)) {
            next.request = defaultRequest
            shouldUpdateCustom = true
            customValue = ''
          } else {
            next.request = 'OTHER'
            shouldUpdateCustom = true
            customValue = defaultRequest
          }
        } else {
          next.request = ''
          shouldUpdateCustom = true
          customValue = ''
        }
      }

      return next
    })

    if (shouldUpdateCustom) {
      setCustomRequest(customValue)
    }
  }

  useEffect(() => {
    let alive = true

    const stateUser = location.state?.user
    if (stateUser) {
      hydrateFromUser(stateUser)
    }

    setIsCheckingAuth(true)
    ;(async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/check`, {
          withCredentials: true,
        })
        if (!alive) return
        if (response?.data?.isAuthenticated && response?.data?.user) {
          hydrateFromUser(response.data.user)
        }
      } catch (error) {
      } finally {
        if (alive) {
          setIsCheckingAuth(false)
        }
      }
    })()

    return () => {
      alive = false
    }
  }, [location.state])

  const handleFormFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (field === 'request' && value !== 'OTHER') {
      setCustomRequest('')
    }
  }

  const handlePhoneChange = (value) => {
    const digits = value.replace(/[^0-9]/g, '')
    const formatted = digits
      .replace(/(^02|^0505|^1\d{3}|^0\d{2})(\d+)?(\d{4})$/, '$1-$2-$3')
      .replace('--', '-')
    handleFormFieldChange('phone', formatted.slice(0, 13))
  }

  const handlePaymentChange = (method) => {
    setPaymentMethod(method)
    setSimplePay('')
    setSelectedCashMethod('')
  }

  const handleCardNumberChange = (field, value) => {
    if (!/^\d*$/.test(value)) return
    setCardNumber((prev) => ({
      ...prev,
      [field]: value.slice(0, 4),
    }))
  }

  const handleExpiryChange = (field, value) => {
    if (!/^\d*$/.test(value)) return
    setExpiry((prev) => ({
      ...prev,
      [field]: value.slice(0, 2),
    }))
  }

  const buildPayloadItems = () =>
    rawItems
      .map((item) => ({
        itemId: pickItemId(item),
        price: pickPrice(item),
        quantity: pickQty(item),
      }))
      .filter(
        (entry) =>
          Number.isFinite(entry.price) &&
          entry.price >= 0 &&
          Number.isFinite(entry.quantity) &&
          entry.quantity > 0 &&
          entry.itemId,
      )

  const handleSubmitOrder = async () => {
    const itemsPayload = buildPayloadItems()
    if (itemsPayload.length === 0) {
      alert('주문할 상품이 없습니다.', '입력 필요', 'warning')
      return
    }

    if (!formData.name.trim()) {
      alert('이름/배송지명을 입력하세요.', '입력 필요', 'warning')
      return
    }

    if (!formData.address.trim()) {
      alert('주소를 입력하세요.', '입력 필요', 'warning')
      return
    }

    const mainAddress = formData.address.trim()
    const addressDetail = formData.addressDetail.trim()

    if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(formData.phone)) {
      alert('전화번호를 정확히 입력하세요.', '입력 필요', 'warning')
      return
    }

    if (formData.request === 'OTHER' && !customRequest.trim()) {
      alert('기타 요청사항을 입력해주세요.', '입력 필요', 'warning')
      return
    }

    const resolvedRequest =
      formData.request === 'OTHER' ? customRequest.trim() : formData.request || ''

    const payload = {
      items: itemsPayload,
      delivery: {
        name: formData.name,
        phone: formData.phone,
        address: mainAddress,
        addressDetail: addressDetail,
        request: resolvedRequest,
      },
      coupon: selectedCoupon ? { code: selectedCoupon.code } : null,
      pricing: {
        orderPrice,
        discount,
        shippingFee,
        payable,
      },
      payment: {
        method: paymentMethod,
        simplePay: paymentMethod === '간편결제' ? simplePay || null : null,
      },
    }

    try {
      const response = await axios.post(`${API_BASE}/order`, payload, {
        withCredentials: true,
      })
      const orderId = response?.data?.id ?? response?.data?.orderId
      if (orderId) {
        alert(`주문이 완료되었습니다. 주문번호: ${orderId}`, '주문 완료', 'success')
      } else {
        alert('주문이 완료되었습니다.', '주문 완료', 'success')
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        '주문 처리 중 오류가 발생했습니다.'
      alert(message, '오류', 'danger')
      if (error?.response?.status === 401) {
        navigate('/login', { state: { from: location.pathname } })
      }
    }
  }

  const handleSelectCoupon = (coupon) => {
    if (!allowStack) {
      setSelectedCoupon(coupon)
    }
  }

  const handleClearCoupon = () => {
    setSelectedCoupon(null)
  }

  if (isCheckingAuth && rawItems.length === 0) {
    return (
      <main className="order-page container py-5 d-flex justify-content-center">
        <Spinner text="주문 정보를 불러오는 중..." />
      </main>
    )
  }

  return (
    <main className="order-page container py-5">
      <PageHeader title="주문/결제" onBack={() => navigate(-1)} className="mb-4" />

      {rawItems.length === 0 && (
        <SectionCard title="주문 안내" className="mb-4" bodyClassName="p-4">
          <p className="mb-0 text-muted">
            현재 페이지로 전달된 주문 상품이 없습니다. 장바구니 또는 상품 상세 페이지에서 다시
            시도해 주세요.
          </p>
        </SectionCard>
      )}

      <div className="row g-4 align-items-start">
        <div className="col-12 col-lg-8 d-flex flex-column gap-4">
          <SectionCard title="배송지 입력" className="section-card--overflow-visible" bodyClassName="p-4">
            <div className="order-card order-card--delivery">
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3 pb-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <span className="badge rounded-pill bg-secondary-subtle text-secondary-emphasis">
                    기본배송지
                  </span>
                  <span className="text-muted small">
                    저장된 배송지가 있다면 자동으로 불러옵니다.
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <Button variant="ghost" size="sm" onClick={clearDelivery}>
                    입력 비우기
                  </Button>
                  <Button variant="ghost" size="sm" onClick={loadDefaultDelivery}>
                    기본배송지 불러오기
                  </Button>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <Input
                    label="이름 / 배송지명"
                    placeholder="집"
                    value={formData.name}
                    onChange={(value) => handleFormFieldChange('name', value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Input
                    label="주소"
                    placeholder="주소를 입력해주세요"
                    value={formData.address}
                    onChange={(value) => handleFormFieldChange('address', value)}
                    required
                    rightButton={{
                      text: '검색',
                      onClick: openAddressSearch,
                      variant: 'outline',
                      size: 'sm',
                    }}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <Input
                    label="상세 주소"
                    placeholder="동/호수 등 상세 주소"
                    value={formData.addressDetail}
                    onChange={(value) => handleFormFieldChange('addressDetail', value)}
                  />
                </div>

                <div className="col-12">
                  <Input
                    label="연락처"
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    type="tel"
                  />
                </div>

                <div className="col-12 col-md-6 col-lg-4">
                  <Selector
                    label="배송시 요청사항"
                    value={formData.request}
                    onChange={(value) => handleFormFieldChange('request', value)}
                    options={REQUEST_OPTIONS}
                    placeholder="배송 요청 선택"
                  />
                </div>

                {formData.request === 'OTHER' && (
                  <div className="col-12 col-md-6">
                    <Textarea
                      label="기타 요청사항"
                      placeholder="예: 부재 시 문 앞에 놓아주세요"
                      value={customRequest}
                      onChange={setCustomRequest}
                      rows={2}
                    />
                  </div>
                )}

                <div className="col-12">
                  <Textarea
                    label="추가 요청 메모 (선택)"
                    placeholder="추가로 전달하고 싶은 내용을 적어주세요."
                    value={formData.memo}
                    onChange={(value) => handleFormFieldChange('memo', value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="결제수단" bodyClassName="p-4">
            <div className="order-card order-card--payment">
              <div className="row row-cols-2 row-cols-md-4 g-2 mb-4">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method} className="col">
                    <Button
                      variant={paymentMethod === method ? 'primary' : 'outline'}
                      size="lg"
                      fullWidth
                      onClick={() => handlePaymentChange(method)}
                    >
                      {method}
                    </Button>
                  </div>
                ))}
              </div>

              {paymentMethod === '간편결제' && (
                <div className="row row-cols-1 row-cols-md-2 g-2">
                  {SIMPLE_PAY_OPTIONS.map((pay) => (
                    <div key={pay.value} className="col d-flex">
                      <Button
                        variant={simplePay === pay.value ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={() => setSimplePay(pay.value)}
                        className="d-flex align-items-center justify-content-center gap-2"
                      >
                        <img src={pay.img} alt={pay.label} className="pay-icon" />
                        {pay.label}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {paymentMethod === '카드결제' && (
                <div className="order-card__panel">
                  <p className="text-muted small mb-2">카드번호</p>
                  <div className="row g-2 mb-3">
                    {['card0', 'card1', 'card2', 'card3'].map((field) => (
                      <div key={field} className="col-3">
                        <Input
                          value={cardNumber[field]}
                          onChange={(value) => handleCardNumberChange(field, value)}
                          placeholder="0000"
                          maxLength={4}
                          type="tel"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <Input
                        label="만료 월 (MM)"
                        value={expiry.expiryMonth}
                        onChange={(value) => handleExpiryChange('expiryMonth', value)}
                        placeholder="MM"
                        maxLength={2}
                        type="tel"
                      />
                    </div>
                    <div className="col-6">
                      <Input
                        label="만료 년 (YY)"
                        value={expiry.expiryYear}
                        onChange={(value) => handleExpiryChange('expiryYear', value)}
                        placeholder="YY"
                        maxLength={2}
                        type="tel"
                      />
                    </div>
                    <div className="col-6">
                      <Input label="CVC" placeholder="123" maxLength={3} type="password" />
                    </div>
                    <div className="col-6">
                      <Input label="비밀번호 앞 2자리" maxLength={2} type="password" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === '현금결제' && (
                <div className="row row-cols-2 g-2">
                  {CASH_METHOD_OPTIONS.map((label) => (
                    <div key={label} className="col d-flex">
                      <Button
                        variant={selectedCashMethod === label ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={() => setSelectedCashMethod(label)}
                      >
                        {label}
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {paymentMethod === '휴대폰결제' && (
                <div className="order-card__panel">
                  <p className="text-muted mb-0">
                    휴대폰 결제를 진행합니다. 안내되는 절차에 따라 인증을 완료해 주세요.
                  </p>
                </div>
              )}
            </div>
        </SectionCard>
      </div>

      <div className="col-12 col-lg-4 d-flex ">
        <SectionCard title="결제하기" className="flex-grow-1" bodyClassName="p-4">
          <div className="order-card order-card--summary">
            <p className="text-muted small mb-3">예상 결제금액</p>

            <div className="border-bottom d-flex justify-content-between py-4">
              <span>총 상품금액</span>
              <strong>{orderPrice.toLocaleString()}원</strong>
            </div>
            <div className="border-bottom d-flex justify-content-between py-4">
              <span>상품할인</span>
              <strong>- 0원</strong>
            </div>
            <div className="border-bottom d-flex justify-content-between py-4">
              <div className="d-flex flex-column gap-2">
                <span>쿠폰할인</span>
                {selectedCoupon && (
                  <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis">
                    {selectedCoupon.name}
                  </span>
                )}
              </div>
              <div className="d-flex flex-column align-items-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCouponModalOpen(true)}
                  icon={<Icon icon="lucide:ticket-percent" width={16} height={16} />}
                >
                  쿠폰 선택
                </Button>
                <strong className="text-danger">-{discount.toLocaleString()}원</strong>
              </div>
            </div>
            <div className="border-bottom d-flex justify-content-between py-4">
              <span>배송비</span>
              <strong>{shippingFee.toLocaleString()}원</strong>
            </div>

            <div className="order-summary__total mt-3">
              <span className="text-muted">총 {totalCount}개 주문금액</span>
              <strong className="order-summary__payable">
                {payable.toLocaleString()}원
              </strong>
            </div>

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleSubmitOrder}
              disabled={rawItems.length === 0}
            >
              구매하기
            </Button>
          </div>
        </SectionCard>
      </div>

      <CouponModal
        open={couponModalOpen}
        coupons={COUPONS}
        selectedCoupon={selectedCoupon}
        onSelect={handleSelectCoupon}
        onClear={() => {
          handleClearCoupon()
          setCouponModalOpen(false)
        }}
        onClose={() => setCouponModalOpen(false)}
      />
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </div>
  </main>
)
}

export default OrderPage
