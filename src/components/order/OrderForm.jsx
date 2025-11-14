import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'

import { useModalHelpers } from '../../hooks/useModalHelpers'

import { AlertModal } from '../common'

import './OrderForm.scss'

const API_BASE = import.meta.env.VITE_APP_API_URL || ''

function OrderForm({ item, cartItems, order }) {
   const navigate = useNavigate()
   const location = useLocation()
   const { alert, alertModal } = useModalHelpers()

   // ===== 공통 유틸 =====
   const toNumber = (n, d = 0) => {
      const v = Number(n)
      return Number.isFinite(v) ? v : d
   }

   // 휴대폰 번호를 3-4-4 / 3-3-4 / 2-4-4 형태로 분해
   const splitPhone = (raw) => {
      if (!raw) return { phone1: '', phone2: '', phone3: '' }
      const digits = String(raw).replace(/[^0-9]/g, '')
      // 02로 시작하고 10자리라면 2-4-4
      if (digits.startsWith('02') && digits.length === 10) {
         return { phone1: digits.slice(0, 2), phone2: digits.slice(2, 6), phone3: digits.slice(6, 10) }
      }
      // 11자리면 3-4-4 (예: 010-1234-5678)
      if (digits.length === 11) {
         return { phone1: digits.slice(0, 3), phone2: digits.slice(3, 7), phone3: digits.slice(7, 11) }
      }
      // 그 외는 3-3-4로 맞춤
      return { phone1: digits.slice(0, 3), phone2: digits.slice(3, 6), phone3: digits.slice(6, 10) }
   }

   // ===== 입력 소스 정규화 =====
   const reduxCartItems = useSelector((s) => s.cart?.items || [])
   const cartArr = Array.isArray(cartItems) ? cartItems : []
   const itemArr = Array.isArray(item) ? item : item ? [item] : []
   const orderArr = Array.isArray(order?.items) ? order.items : []
   const stateArr = Array.isArray(location.state?.items) ? location.state.items : Array.isArray(location.state?.cartItems) ? location.state.cartItems : location.state?.item ? [location.state.item] : []

   // 우선순위: cartItems → item → order.items → router state → reduxCart
   const rawItems = useMemo(() => {
      return cartArr.length ? cartArr : itemArr.length ? itemArr : orderArr.length ? orderArr : stateArr.length ? stateArr : Array.isArray(reduxCartItems) ? reduxCartItems : []
   }, [cartArr, itemArr, orderArr, stateArr, reduxCartItems])

   // ===== 가격/수량/아이템ID 추출 (여러 키 지원) =====
   const pickPrice = (it) => toNumber(it?.price ?? it?.Item?.price ?? it?.unitPrice ?? it?.salePrice ?? it?.originPrice, 0)

   const pickQty = (it) => toNumber(it?.quantity ?? it?.count ?? it?.qty ?? it?.amount ?? 1, 1)

   const pickItemId = (it) => it?.itemId ?? it?.ItemId ?? it?.id ?? it?.Item?.id

   // ===== 합계/수량 =====
   const orderPrice = useMemo(() => rawItems.reduce((sum, it) => sum + pickPrice(it) * pickQty(it), 0), [rawItems])

   const totalCount = useMemo(() => rawItems.reduce((sum, it) => sum + pickQty(it), 0), [rawItems])

   // ===== 쿠폰/배송 =====
   const allowStack = false
   const COUPONS = [
      { code: 'WELCOME20', name: '신규가입 20% 쿠폰', type: 'percent', value: 20 },
      { code: 'SAVE5000', name: '5,000원 즉시할인', type: 'fixed', value: 5000 },
      // { code: 'FREESHIP',  name: '배송비 무료 쿠폰', type: 'shippingFree' },
   ]

   const [couponModalOpen, setCouponModalOpen] = useState(false)
   const [selectedCoupon, setSelectedCoupon] = useState(null)

   const calcDiscountByCoupon = (subtotal, coupon) => {
      if (!coupon) return 0
      if (coupon.type === 'percent') return Math.floor(subtotal * (coupon.value / 100))
      if (coupon.type === 'fixed') return Math.min(subtotal, coupon.value)
      return 0
   }

   const discount = calcDiscountByCoupon(orderPrice, selectedCoupon)
   const afterDiscount = Math.max(0, orderPrice - discount)

   const hasShippingFree = selectedCoupon?.type === 'shippingFree'
   const shippingFee = hasShippingFree ? 0 : afterDiscount >= 30000 ? 0 : afterDiscount > 0 ? 3000 : 0

   const payable = afterDiscount + shippingFee

   // ===== 폼 상태 =====
   const [formData, setFormData] = useState({
      name: '',
      phone1: '',
      phone2: '',
      phone3: '',
      address: '',
      request: '',
   })
   const [paymentMethod, setPaymentMethod] = useState('간편결제')
   const [simplePay, setSimplePay] = useState('')
   const [cardNumber, setCardNumber] = useState({ card0: '', card1: '', card2: '', card3: '' })
   const [expiry, setExpiry] = useState({ expiryMonth: '', expiryYear: '' })
   const [selectedCashMethod, setSelectedCashMethod] = useState('')

   // ===== 로그인 유저 정보 자동 입력 =====
   useEffect(() => {
      let alive = true

      const hydrateFromUser = (user) => {
         if (!user) return
         const phoneParts = splitPhone(user.phoneNumber)
         setFormData((prev) => ({
            ...prev,
            name: prev.name || user.name || '',
            address: prev.address || user.address || '',
            phone1: prev.phone1 || phoneParts.phone1,
            phone2: prev.phone2 || phoneParts.phone2,
            phone3: prev.phone3 || phoneParts.phone3,
         }))
      }

      // 1) 라우터 state에 유저가 실려온 경우 우선 적용
      const stateUser = location.state?.user
      if (stateUser)
         hydrateFromUser(stateUser)

         // 2) 세션 기반 로그인 확인 (백엔드 /auth/check)
      ;(async () => {
         try {
            const res = await axios.get(`${API_BASE}/auth/check`, { withCredentials: true })
            if (!alive) return
            if (res?.data?.isAuthenticated && res?.data?.user) {
               hydrateFromUser(res.data.user)
            }
         } catch (err) {
         }
      })()

      // 3) (옵션) 로컬스토리지/리덕스 등에서 추가 보강
      // const authUser = useSelector((s) => s.auth?.user) //
      // hydrateFromUser(authUser)

      return () => {
         alive = false
      }
   }, [location.state])

   const handleChange = (e) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
   }
   const handlePaymentChange = (event, newMethod) => {
      event.preventDefault()
      if (newMethod !== null) setPaymentMethod(newMethod)
   }
   const handleSimplePaySelect = (method) => setSimplePay(method)
   const handleCardNumberChange = (e) => {
      const { name, value } = e.target
      if (!/^\d*$/.test(value)) return
      setCardNumber((prev) => ({ ...prev, [name]: value }))
   }
   const handleExpiryChange = (e) => {
      const { name, value } = e.target
      if (!/^\d*$/.test(value)) return
      setExpiry((prev) => ({ ...prev, [name]: value }))
   }

   // ===== 구매하기 (주문 생성) =====
   const handleSubmitOrder = async () => {
      // 1) 기본 검증
      if (rawItems.length === 0) {
         alert('주문할 상품이 없습니다.', '입력 필요', 'warning')
         return
      }
      if (!formData.name?.trim()) return alert('이름/배송지명을 입력하세요.', '입력 필요', 'warning')
      if (!formData.address?.trim()) return alert('주소를 입력하세요.', '입력 필요', 'warning')
      const phone = `${formData.phone1}-${formData.phone2}-${formData.phone3}`
      if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(phone)) {
         return alert('전화번호를 정확히 입력하세요.', '입력 필요', 'warning')
      }

      // 2) 서버 페이로드 구성 (백엔드 요구: { items: [{ itemId, price, quantity }] })
      const payloadItems = rawItems
         .map((it) => ({
            itemId: pickItemId(it),
            price: pickPrice(it),
            quantity: pickQty(it),
         }))
         .filter((r) => Number.isFinite(r.price) && r.price >= 0 && Number.isFinite(r.quantity) && r.quantity > 0 && r.itemId)

      if (payloadItems.length === 0) {
         alert('상품 데이터가 올바르지 않습니다.', '오류', 'danger')
         return
      }

      const payload = {
         items: payloadItems,
         delivery: {
            name: formData.name,
            phone,
            address: formData.address,
            request: formData.request || '',
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
            simplePay: simplePay || null,
         },
      }

      try {
         const res = await axios.post(`${API_BASE}/order`, payload, { withCredentials: true })
         const orderId = res?.data?.id ?? res?.data?.orderId
         if (orderId) {
            // 주문상세 라우트가 있을 때:
            alert(`주문이 완료되었습니다. 주문번호: ${orderId}`, '완료', 'success')
         } else {
            alert('주문이 완료되었습니다.', '완료', 'success')
         }
      } catch (err) {
         const msg = err?.response?.data?.message || err?.message || '주문 처리 중 오류가 발생했습니다.'
         alert(msg, '오류', 'danger')
         if (err?.response?.status === 401) {
            // 로그인 만료시 로그인 페이지로 유도 (필요시 라우팅 수정)
            navigate('/login', { state: { from: location.pathname } })
         }
      }
   }

   // ===== 쿠폰 모달 =====
   const CouponModal = ({ open, onClose, onSelect, coupons, selected }) => {
      if (!open) return null
      return (
         <div role="dialog" aria-modal="true" className="coupon-modal-backdrop" onClick={onClose}>
            <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
               <div>
                  <span>쿠폰 선택</span>
                  <button onClick={onClose} style={{ all: 'unset', fontSize: 18, lineHeight: 1 }}>
                     ✕
                  </button>
               </div>

               <div className="coupon-list">
                  {coupons.map((c) => {
                     const active = selected?.code === c.code
                     return (
                        <button key={c.code} onClick={() => onSelect(c)} className={`coupon-btn ${active ? 'active' : ''}`}>
                           <div className="coupon-info">
                              <div>{c.name}</div>
                              <div>코드: {c.code}</div>
                           </div>
                           {active ? <span style={{ fontWeight: 700 }}>선택됨</span> : <span>선택</span>}
                        </button>
                     )
                  })}
               </div>

               <div className="coupon-modal-footer">
                  {selected && (
                     <button className="btn-cancel" onClick={() => onSelect(null)}>
                        선택 해제
                     </button>
                  )}
               </div>
            </div>
         </div>
      )
   }

   return (
      <section id="order-section">
         <h1 className="section-title">주문/결제</h1>
         <div className="section-contents">
            {/* 좌측 */}
            <div className="order-left">
               {/* 주문 상품 없을 때 안내 */}
               {rawItems.length === 0 && (
                  <div className="contents-card" style={{ marginBottom: 16 }}>
                     <div className="card-header">
                        <div className="window-btn">
                           <span className="red"></span>
                           <span className="green"></span>
                           <span className="blue"></span>
                        </div>
                        <span className="card-title">안내</span>
                     </div>
                     <div style={{ padding: 16 }}>현재 페이지로 전달된 주문 상품이 없습니다. 장바구니 또는 상품상세에서 다시 시도해 주세요.</div>
                  </div>
               )}

               {/* 배송지 입력 */}
               <div className="contents-card">
                  <div className="card-header">
                     <div className="window-btn">
                        <span className="red"></span>
                        <span className="green"></span>
                        <span className="blue"></span>
                     </div>
                     <span className="card-title">배송지 입력</span>
                  </div>
                  <div className="delivery-address">
                     <div>
                        <p className="sub-title"> 기존배송지 </p>
                        <button className="address-btn" onClick={() => setFormData({ name: '', phone1: '', phone2: '', phone3: '', address: '', request: '' })}>
                           배송지 변경하기
                        </button>
                     </div>
                     <form className="address-input-group" onSubmit={(e) => e.preventDefault()}>
                        <div className="address-input name">
                           <label>이름 / 배송지명</label>
                           <input type="text" name="name" placeholder="집" value={formData.name} onChange={handleChange} />
                        </div>
                        <div className="address-input">
                           <label>전화번호</label>
                           <div className="phone-input-group">
                              <input type="text" name="phone1" maxLength="3" value={formData.phone1} onChange={handleChange} />
                              <span className="hyphen">-</span>
                              <input type="text" name="phone2" maxLength="4" value={formData.phone2} onChange={handleChange} />
                              <span className="hyphen">-</span>
                              <input type="text" name="phone3" maxLength="4" value={formData.phone3} onChange={handleChange} />
                           </div>
                        </div>
                        <div className="address-input">
                           <label>주소</label>
                           <input type="text" name="address" value={formData.address} onChange={handleChange} />
                        </div>
                        <div className="address-input">
                           <label>배송시 요청사항</label>
                           <select name="request" value={formData.request} onChange={handleChange}>
                              <option value="">선택 안 함</option>
                              <option value="문 앞에 두고 가주세요">문 앞에 두고 가주세요</option>
                              <option value="배송 전 연락주세요">배송 전 연락주세요</option>
                           </select>
                        </div>
                     </form>
                  </div>
               </div>

               {/* 결제수단 */}
               <div className="contents-card">
                  <div className="card-header">
                     <div className="window-btn">
                        <span className="red"></span>
                        <span className="green"></span>
                        <span className="blue"></span>
                     </div>
                     <span className="card-title">결제수단</span>
                  </div>
                  <div className="payment-method">
                     <div className="button-group">
                        {['간편결제', '카드결제', '현금결제', '휴대폰결제'].map((method) => (
                           <button key={method} className={paymentMethod === method ? 'active' : ''} onClick={(e) => handlePaymentChange(e, method)}>
                              {method}
                           </button>
                        ))}
                     </div>

                     {/* 간편결제 */}
                     {paymentMethod === '간편결제' && (
                        <div className="simple-payment">
                           {[
                              { label: '토스페이', value: '토스페이', img: '/images/tosspay.png' },
                              { label: '네이버페이', value: '네이버페이', img: '/images/naverpay.png' },
                              { label: '애플페이', value: '애플페이', img: '/images/applepay.png' },
                              { label: '카카오페이', value: '카카오페이', img: '/images/kakaopay.png' },
                           ].map((m) => (
                              <button
                                 key={m.value}
                                 onClick={(e) => {
                                    e.preventDefault()
                                    setSimplePay(m.value)
                                 }}
                                 className={simplePay === m.value ? 'active' : ''}
                              >
                                 <img src={m.img} alt={m.label} className="pay-icon" />
                                 {m.label}
                              </button>
                           ))}
                        </div>
                     )}

                     {/* 카드결제 */}
                     {paymentMethod === '카드결제' && (
                        <div className="card-payment">
                           <p>카드번호</p>
                           <div className="card-payment-input card-number-wrapper">
                              {['card0', 'card1', 'card2', 'card3'].map((field, index) => (
                                 <React.Fragment key={field}>
                                    <input type="text" maxLength={4} name={field} placeholder="0000" value={cardNumber[field]} onChange={handleCardNumberChange} className="card-input" />
                                    {index < 3 && <span className="hyphen">-</span>}
                                 </React.Fragment>
                              ))}
                           </div>
                           <div className="card-payment-input expiry-date">
                              <p>만료일</p>
                              <div>
                                 <input type="text" maxLength={2} name="expiryMonth" placeholder="MM" value={expiry.expiryMonth} onChange={handleExpiryChange} className="expiry-input" />
                                 <span>/</span>
                                 <input type="text" maxLength={2} name="expiryYear" placeholder="YY" value={expiry.expiryYear} onChange={handleExpiryChange} className="expiry-input" />
                              </div>
                           </div>
                           <div className="card-payment-input cvc">
                              <p>CVC</p>
                              <input placeholder="123" />
                           </div>
                           <div className="card-payment-input card-password ">
                              <p>비밀번호</p>
                              <input placeholder="앞 2자리" />
                           </div>
                        </div>
                     )}

                     {/* 현금결제 */}
                     {paymentMethod === '현금결제' && (
                        <div className="cash-payment">
                           {['무통장입금', '편의점결제'].map((label) => (
                              <button
                                 key={label}
                                 onClick={(e) => {
                                    e.preventDefault()
                                    setSelectedCashMethod(label)
                                 }}
                                 className={selectedCashMethod === label ? 'active' : ''}
                              >
                                 {label}
                              </button>
                           ))}
                        </div>
                     )}

                     {/* 휴대폰결제 */}
                     {paymentMethod === '휴대폰결제' && (
                        <div className="phone-payment">
                           <p>휴대폰 결제를 진행합니다.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* 우측 결제하기 */}
            <div className="contents-card order-right">
               <div className="card-header">
                  <div className="window-btn">
                     <span className="red"></span>
                     <span className="green"></span>
                     <span className="blue"></span>
                  </div>
                  <span className="card-title">결제하기</span>
               </div>

               <div className="order-paying">
                  <p className="sub-title">예상 결제금액</p>
                  <div className="paying-group">
                     <div>
                        <p>총 상품금액: </p>
                        <p>{orderPrice.toLocaleString()}원</p>
                     </div>

                     {/* 쿠폰 영역 */}
                     <div className="coupon-discount">
                        <p>쿠폰할인:</p>
                        <div>
                           <button onClick={() => setCouponModalOpen(true)}>쿠폰선택</button>
                           {selectedCoupon && (
                              <div>
                                 <p className="coupon">
                                    {selectedCoupon.name} 적용 (-{discount.toLocaleString()}원)
                                 </p>
                                 <button className="coupon-delete" onClick={() => setSelectedCoupon(null)}>
                                    해제
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>

                     <div>
                        <p>배송비: </p>
                        <p>{shippingFee.toLocaleString()}원</p>
                     </div>
                  </div>

                  <div className="total-sum">
                     <p>총 {totalCount}개 주문금액</p>
                     <p>{payable.toLocaleString()}원</p>
                  </div>

                  <button className="order-btn" type="button" onClick={handleSubmitOrder}>
                     구매하기
                  </button>
               </div>
            </div>
         </div>

         {/* 쿠폰 선택 모달 */}
         <CouponModal
            open={couponModalOpen}
            onClose={() => setCouponModalOpen(false)}
            onSelect={(c) => {
               if (!allowStack) {
                  setSelectedCoupon(c)
                  setCouponModalOpen(false)
                  return
               }
               // 다중 적용 모드 확장 시 여기에 배열 업데이트
            }}
            coupons={COUPONS}
            selected={selectedCoupon}
         />
         <AlertModal
            open={alertModal.isOpen}
            onClose={alertModal.close}
            title={alertModal.config.title}
            message={alertModal.config.message}
            buttonText={alertModal.config.buttonText}
            variant={alertModal.config.variant}
         />
      </section>
   )
}

export default OrderForm
