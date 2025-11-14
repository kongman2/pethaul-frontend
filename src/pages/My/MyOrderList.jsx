import { useEffect, useMemo, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'

import { cancelOrderThunk, fetchOrdersThunk, fetchOrderByIdThunk, confirmPurchaseThunk } from '../../features/orderSlice'
import { createExchangeReturnThunk } from '../../features/exchangeReturnSlice'

import { SectionCard, Button, Spinner, PageHeader, Pagination, Tabs, Modal, AlertModal, ConfirmModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import { getPlaceholderImage } from '../../utils/imageUtils'
import useAppBackground from '../../hooks/useAppBackground'
import './MyOrderList.scss'

function MyOrderList() {
   useAppBackground('app-bg--blue')
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const { orders, loading, error, pagination } = useSelector((state) => state.order)
   const { alert, confirm, alertModal, confirmModal } = useModalHelpers()
   const [showExchangeReturnModal, setShowExchangeReturnModal] = useState(false)
   const [showOrderDetailModal, setShowOrderDetailModal] = useState(false)
   const [showPurchaseConfirmModal, setShowPurchaseConfirmModal] = useState(false)
   const [selectedOrder, setSelectedOrder] = useState(null)
   const [orderDetail, setOrderDetail] = useState(null)
   const [exchangeReturnType, setExchangeReturnType] = useState('EXCHANGE')
   const [exchangeReturnReason, setExchangeReturnReason] = useState('')
   const [agreeToTerms, setAgreeToTerms] = useState(false)

   const [page, setPage] = useState(1)
   const LIMIT = 10
   const hasErrorRef = useRef(false)
   const lastPageRef = useRef(null)

   // 페이지 변경 시마다 재요청
   useEffect(() => {
      // 같은 페이지를 반복 요청하지 않도록 방지
      if (lastPageRef.current === page && hasErrorRef.current) {
         return
      }
      
      lastPageRef.current = page
      hasErrorRef.current = false
      
      dispatch(fetchOrdersThunk({ page, limit: LIMIT }))
         .unwrap()
         .catch((err) => {
            hasErrorRef.current = true
         })
   }, [dispatch, page])

   // 에러 상태 추적
   useEffect(() => {
      if (error) {
         hasErrorRef.current = true
      }
   }, [error])

   const rows = useMemo(() => [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)), [orders])

   const handleOrderCancel = (id) => {
      confirm('정말 주문을 취소하시겠습니까?', () => {
         dispatch(cancelOrderThunk(id))
            .unwrap()
            .then(() => {
               alert('주문을 취소했습니다.', '완료', 'success')
               dispatch(fetchOrdersThunk({ page, limit: LIMIT }))
            })
            .catch((error) => {
               alert('주문 취소 중 에러가 발생했습니다.:' + error, '오류', 'danger')
            })
      }, '주문 취소 확인', '취소', '취소', 'danger')
   }

   const handleOrderDetail = async (order) => {
      setSelectedOrder(order)
      setShowOrderDetailModal(true)
      try {
         const result = await dispatch(fetchOrderByIdThunk(order.id)).unwrap()
         setOrderDetail(result.order)
      } catch (error) {
         alert('주문 상세 정보를 불러오는데 실패했습니다.', '오류', 'danger')
      }
   }

   const handlePurchaseConfirm = async () => {
      if (!selectedOrder) return
      try {
         await dispatch(confirmPurchaseThunk(selectedOrder.id)).unwrap()
         alert('구매가 확정되었습니다.', '완료', 'success')
         setShowPurchaseConfirmModal(false)
         setSelectedOrder(null)
         dispatch(fetchOrdersThunk({ page, limit: LIMIT }))
      } catch (error) {
         alert(error || '구매 확정 중 오류가 발생했습니다.', '오류', 'danger')
      }
   }

   const apiBase = import.meta.env.VITE_APP_API_URL || ''

   const getOrderStatusLabel = (status) => {
      const statusMap = {
         ORDER: '판매자확인',
         READY: '상품준비중',
         SHIPPED: '배송중',
         DELIVERED: '배송완료',
         CANCEL: '취소완료'
      }
      return statusMap[status] || status
   }

   const getOrderStatusBadge = (status) => {
      const badgeMap = {
         ORDER: 'warning',
         READY: 'info',
         SHIPPED: 'primary',
         DELIVERED: 'success',
         CANCEL: 'secondary'
      }
      return badgeMap[status] || 'secondary'
   }

   if (loading) {
      return (
         <section className="container py-5">
            <Spinner fullPage text="주문 내역을 불러오는 중..." />
         </section>
      )
   }

   if (error) {
      return (
         <section className="container py-5">
            <p className="text-center text-danger">에러 발생: {error}</p>
         </section>
      )
   }

   return (
      <section className="container py-5">
         <PageHeader title="주문/배송 조회" onBack={() => navigate(-1)} className="mb-4" />

         {rows && rows.length > 0 ? (
            <div className="row g-4">
               {rows.map((order) => (
                  <div key={order.id} className="col-12">
                     <SectionCard
                        title={`주문일자: ${order.orderDate?.slice(0, 10) ?? ''}`}
                     >
                        <div>
                           {/* 주문 상태 배지 */}
                           <div className="mb-2 d-flex gap-1 flex-wrap align-items-center">
                              <span className={`badge bg-${getOrderStatusBadge(order.orderStatus)}`}>
                                 {getOrderStatusLabel(order.orderStatus)}
                              </span>
                              {order.orderStatus === 'DELIVERED' && order.isPurchaseConfirmed && (
                                 <span className="badge bg-success">구매 확정</span>
                              )}
                           </div>
                           
                           {/* 주문 상품 목록 */}
                           <div className="row g-3">
                              {order.Items?.map((item) => {
                                 const imgSrc = apiBase + (item?.ItemImages?.[0]?.imgUrl || '')
                                 return (
                                    <div key={item.id} className="col-12">
                                          <div className="row g-2 g-md-3 mb-3">
                                             <div className="col-auto">
                                                <img
                                                   src={imgSrc}
                                                   alt={item.itemNm}
                                                   className="order-item-img"
                                                   onError={(e) => {
                                                      e.currentTarget.src = getPlaceholderImage()
                                                   }}
                                                />
                                             </div>
                                             <div className="col">
                                                <div className="d-flex flex-column justify-content-between h-100">
                                                   <div>
                                                      <h6 className="card-title mb-1 mb-md-2 small">{item.itemNm}</h6>
                                                      <p className="card-text mb-1 small">
                                                         <strong>{item.OrderItem.orderPrice?.toLocaleString()}원</strong>
                                                         <span className="text-muted ms-2">x {item.OrderItem.count}개</span>
                                                      </p>
                                                   </div>
                                                   {/* 주문 완료(DELIVERED) 상태일 때만 리뷰 작성, 재주문 버튼 표시 */}
                                                   {order.orderStatus === 'DELIVERED' && (
                                                      <div className="d-flex flex-wrap gap-1 gap-md-2 mt-2 mt-md-3">
                                                         <Link to="/review/create" state={{ item }}>
                                                            <Button variant="outline" size="sm" className="small">리뷰 작성</Button>
                                                         </Link>
                                                         <Button variant="outline" size="sm" className="small">재주문</Button>
                                                      </div>
                                                   )}
                                                </div>
                                             </div>
                                          </div>
                                    </div>
                                 )
                              })}
                           </div>

                           {/* 주문 액션 버튼 */}
                           <div className="d-flex flex-wrap gap-1 gap-md-2 justify-content-end border-top pt-2 pt-md-3 mt-2 mt-md-3">
                              {/* 주문 취소: ORDER 상태에서만 가능 */}
                              {order.orderStatus === 'ORDER' && (
                                 <Button variant="danger" size="sm" className="small" onClick={() => handleOrderCancel(order.id)}>
                                    주문 취소
                                 </Button>
                              )}
                              {order.orderStatus === 'SHIPPED' && (
                                 <Button variant="outline" size="sm" className="small">배송 조회</Button>
                              )}
                              {/* 교환/반품 신청: DELIVERED 상태에서 가능 (구매 확정 전) */}
                              {order.orderStatus === 'DELIVERED' && !order.isPurchaseConfirmed && (
                                 <>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       className="small"
                                       onClick={() => {
                                          setSelectedOrder(order)
                                          setShowExchangeReturnModal(true)
                                       }}
                                    >
                                       교환/반품 신청
                                    </Button>
                                    <Button 
                                       variant="outline" 
                                       size="sm" 
                                       className="small"
                                       onClick={() => {
                                          setSelectedOrder(order)
                                          setShowPurchaseConfirmModal(true)
                                       }}
                                    >
                                       구매 확정
                                    </Button>
                                 </>
                              )}
                              <Button 
                                 variant="outline" 
                                 size="sm" 
                                 className="small"
                                 onClick={() => handleOrderDetail(order)}
                              >
                                 주문 상세보기
                              </Button>
                           </div>
                        </div>
                     </SectionCard>
                  </div>
                  ))}
            </div>
         ) : (
            <div className="text-center py-5">
               <p className="text-muted">주문 내역이 없습니다.</p>
               <Link to="/items/search">
                  <Button variant="primary" className="mt-3">쇼핑하러 가기</Button>
               </Link>
            </div>
         )}

         {/* 주문 상세보기 모달 */}
         <Modal 
            open={showOrderDetailModal} 
            onClose={() => {
               setShowOrderDetailModal(false)
               setOrderDetail(null)
               setSelectedOrder(null)
            }} 
            title="주문 상세보기"
            size="lg"
            footer={
               <Button variant="secondary" onClick={() => {
                  setShowOrderDetailModal(false)
                  setOrderDetail(null)
                  setSelectedOrder(null)
               }}>
                  닫기
               </Button>
            }
         >
            {orderDetail ? (
               <div className="row g-3">
                  <div className="col-12">
                     <div className="mb-3">
                        <strong>주문번호:</strong> {orderDetail.id}
                     </div>
                     <div className="mb-3">
                        <strong>주문일자:</strong> {orderDetail.orderDate?.slice(0, 19).replace('T', ' ')}
                     </div>
                     <div className="mb-3">
                        <strong>주문 상태:</strong>{' '}
                        <div className="d-inline-flex gap-1 align-items-center">
                           <span className={`badge bg-${getOrderStatusBadge(orderDetail.orderStatus)}`}>
                              {getOrderStatusLabel(orderDetail.orderStatus)}
                           </span>
                           {orderDetail.orderStatus === 'DELIVERED' && orderDetail.isPurchaseConfirmed && (
                              <span className="badge bg-success">구매 확정</span>
                           )}
                        </div>
                     </div>
                     {orderDetail.deliveryName && (
                        <div className="mb-3">
                           <strong>수령인:</strong> {orderDetail.deliveryName}
                        </div>
                     )}
                     {orderDetail.deliveryPhone && (
                        <div className="mb-3">
                           <strong>연락처:</strong> {orderDetail.deliveryPhone}
                        </div>
                     )}
                     {(orderDetail.deliveryAddress || orderDetail.deliveryAddressDetail) && (
                        <div className="mb-3">
                           <strong>배송지:</strong>{' '}
                           {[orderDetail.deliveryAddress, orderDetail.deliveryAddressDetail].filter(Boolean).join(' ')}
                        </div>
                     )}
                     {orderDetail.deliveryRequest && (
                        <div className="mb-3">
                           <strong>배송 요청사항:</strong> {orderDetail.deliveryRequest}
                        </div>
                     )}
                     {orderDetail.Items && Array.isArray(orderDetail.Items) && orderDetail.Items.length > 0 && (
                        <div className="mb-3">
                           <strong>주문 상품:</strong>
                           <div className="mt-2">
                              {orderDetail.Items.map((item, idx) => (
                                 <div key={item.id || idx} className="border-bottom pb-2 mb-2">
                                    <div>{item.itemNm || '상품명 없음'}</div>
                                    <div className="text-muted small">
                                       {item.OrderItem?.orderPrice?.toLocaleString() || 0}원 × {item.OrderItem?.count || 0}개
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                     <div className="mb-3">
                        <strong>총 주문 금액:</strong>{' '}
                        {orderDetail.Items?.reduce((sum, item) => {
                           return sum + (item.OrderItem?.orderPrice || 0) * (item.OrderItem?.count || 0)
                        }, 0).toLocaleString() || 0}원
                     </div>
                  </div>
               </div>
            ) : (
               <Spinner text="주문 정보를 불러오는 중..." />
            )}
         </Modal>

         {/* 구매 확정 모달 */}
         <Modal 
            open={showPurchaseConfirmModal} 
            onClose={() => {
               setShowPurchaseConfirmModal(false)
               setSelectedOrder(null)
            }}
            title="구매 확정"
            footer={
               <>
                  <Button variant="secondary" onClick={() => {
                     setShowPurchaseConfirmModal(false)
                     setSelectedOrder(null)
                  }}>
                     취소
                  </Button>
                  <Button variant="primary" onClick={handlePurchaseConfirm}>
                     구매 확정
                  </Button>
               </>
            }
         >
            <p>구매를 확정하시겠습니까?</p>
            <p className="text-muted small">구매 확정 후에는 교환/반품 신청이 제한될 수 있습니다.</p>
         </Modal>

         {/* 교환/반품 신청 모달 */}
         <Modal 
            open={showExchangeReturnModal} 
            onClose={() => {
               setShowExchangeReturnModal(false)
               setAgreeToTerms(false)
               setExchangeReturnReason('')
               setExchangeReturnType('EXCHANGE')
            }}
            title="교환/반품 신청"
            footer={
               <>
                  <Button variant="secondary" onClick={() => {
                     setShowExchangeReturnModal(false)
                     setAgreeToTerms(false)
                     setExchangeReturnReason('')
                     setExchangeReturnType('EXCHANGE')
                  }}>
                     취소
                  </Button>
                  <Button
                     variant="primary"
                     onClick={async () => {
                        if (!exchangeReturnReason.trim()) {
                           alert('사유를 입력해주세요.', '입력 필요', 'warning')
                           return
                        }
                        if (!agreeToTerms) {
                           alert('교환/반품 약관에 동의해주세요.', '동의 필요', 'warning')
                           return
                        }
                        try {
                           await dispatch(
                              createExchangeReturnThunk({
                                 orderId: selectedOrder.id,
                                 type: exchangeReturnType,
                                 reason: exchangeReturnReason,
                              })
                           ).unwrap()
                           alert('교환/반품 신청이 완료되었습니다.', '완료', 'success')
                           setShowExchangeReturnModal(false)
                           setExchangeReturnReason('')
                           setExchangeReturnType('EXCHANGE')
                           setAgreeToTerms(false)
                           dispatch(fetchOrdersThunk({ page, limit: LIMIT }))
                        } catch (error) {
                           alert(error || '교환/반품 신청 중 오류가 발생했습니다.', '오류', 'danger')
                        }
                     }}
                  >
                     신청
                  </Button>
               </>
            }
         >
            <div className="mb-3">
               <label className="form-label">유형 선택</label>
               <select
                  className="form-select"
                  value={exchangeReturnType}
                  onChange={(e) => setExchangeReturnType(e.target.value)}
               >
                  <option value="EXCHANGE">교환</option>
                  <option value="RETURN">반품</option>
               </select>
            </div>
            <div className="mb-3">
               <label className="form-label">사유</label>
               <textarea
                  className="form-control"
                  rows="4"
                  value={exchangeReturnReason}
                  onChange={(e) => setExchangeReturnReason(e.target.value)}
                  placeholder="교환/반품 사유를 입력하세요"
               />
            </div>
            
            {/* 교환/반품 약관 */}
            <div className="mb-3">
               <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <h6 className="fw-bold mb-2">교환/반품 약관</h6>
                  <div className="small">
                     <p className="mb-2"><strong>1. 교환/반품 가능 기간</strong></p>
                     <p className="mb-2">배송 완료 후 7일 이내에만 교환/반품 신청이 가능합니다.</p>
                     
                     <p className="mb-2"><strong>2. 배송비 책임</strong></p>
                     <ul className="mb-2 ps-3">
                        <li>상품의 하자나 오배송의 경우: 판매자 부담</li>
                        <li className="text-danger"><strong>구매자 과실(단순 변심, 주문 실수 등)의 경우: 구매자 부담</strong></li>
                        <li>교환 시 추가 배송비가 발생할 수 있습니다.</li>
                     </ul>
                     
                     <p className="mb-2"><strong>3. 교환/반품 불가 사유</strong></p>
                     <ul className="mb-2 ps-3">
                        <li>고객의 사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우</li>
                        <li>시간이 지나 재판매가 어려울 정도로 상품의 가치가 감소한 경우</li>
                        <li>복제가 가능한 상품의 포장을 훼손한 경우</li>
                     </ul>
                     
                     <p className="mb-2"><strong>4. 처리 절차</strong></p>
                     <p className="mb-0">신청 후 관리자 검토를 거쳐 승인/거부가 결정됩니다. 처리 결과는 신청 내역에서 확인하실 수 있습니다.</p>
                  </div>
               </div>
               <div className="form-check mt-2">
                  <input
                     className="form-check-input"
                     type="checkbox"
                     id="agreeToTerms"
                     checked={agreeToTerms}
                     onChange={(e) => setAgreeToTerms(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="agreeToTerms">
                     교환/반품 약관을 확인하였으며, 구매자 과실인 경우 배송비를 부담하는 것에 동의합니다.
                  </label>
               </div>
            </div>
         </Modal>

         {/* 페이지네이션 */}
         {rows && rows.length > 0 && (
            <Pagination
               currentPage={pagination?.currentPage ?? page}
               totalPages={pagination?.totalPages ?? 1}
               onPageChange={(newPage) => setPage(newPage)}
               className="mt-4"
            />
         )}

         {/* 모달들 */}
         <AlertModal
            open={alertModal.isOpen}
            onClose={alertModal.close}
            title={alertModal.config.title}
            message={alertModal.config.message}
            buttonText={alertModal.config.buttonText}
            variant={alertModal.config.variant}
         />
         <ConfirmModal
            open={confirmModal.isOpen}
            onClose={confirmModal.close}
            onConfirm={confirmModal.confirm}
            title={confirmModal.config.title}
            message={confirmModal.config.message}
            confirmText={confirmModal.config.confirmText}
            cancelText={confirmModal.config.cancelText}
            variant={confirmModal.config.variant}
         />
      </section>
   )
}

export default MyOrderList
