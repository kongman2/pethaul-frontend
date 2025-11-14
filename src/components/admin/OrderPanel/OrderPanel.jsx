import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'

import { fetchAllOrdersThunk, updateOrderStatusThunk, cancelOrderThunk } from '../../../features/orderSlice'
import { getAllExchangeReturnsThunk, updateExchangeReturnStatusThunk } from '../../../features/exchangeReturnSlice'
import { useConfirmModal } from '../../../hooks/useConfirmModal'
import { useAlertModal } from '../../../hooks/useAlertModal'

import { SectionCard, Button, Spinner, Selector, ConfirmModal, AlertModal, Tabs, Modal, Input } from '../../common'
import FilterForm from '../../common/FilterForm/FilterForm'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'

import './OrderPanel.scss'

const ORDER_STATUS_OPTIONS = [
  { value: 'ORDER', label: '판매자확인' },
  { value: 'READY', label: '상품준비중' },
  { value: 'SHIPPED', label: '배송중' },
  { value: 'DELIVERED', label: '배송완료' },
  { value: 'CANCEL', label: '취소완료' },
]

const EXCHANGE_RETURN_STATUS_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'PENDING', label: '대기중' },
  { value: 'APPROVED', label: '승인됨' },
  { value: 'REJECTED', label: '거부됨' },
  { value: 'COMPLETED', label: '완료됨' },
]

const EXCHANGE_RETURN_TYPE_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'EXCHANGE', label: '교환' },
  { value: 'RETURN', label: '반품' },
]

const getOrderStatusLabel = (status) => {
  const statusMap = {
    ORDER: '판매자확인',
    READY: '상품준비중',
    SHIPPED: '배송중',
    DELIVERED: '배송완료',
    CANCEL: '취소완료',
  }
  return statusMap[status] || status
}

function OrderPanel() {
  const dispatch = useDispatch()
  const { orders = [], loading, error } = useSelector((state) => state.order)
  const exchangeReturnState = useSelector((state) => state.exchangeReturn)
  const { allExchangeReturns = [], loading: exchangeReturnLoading, error: exchangeReturnError } = exchangeReturnState || {}
  const [activeTab, setActiveTab] = useState('orders') // 'orders' or 'exchangeReturns'
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectingExchangeReturnId, setRejectingExchangeReturnId] = useState(null)
  
  // 교환/반품 필터
  const [exchangeReturnStatusFilter, setExchangeReturnStatusFilter] = useState('all')
  const [exchangeReturnTypeFilter, setExchangeReturnTypeFilter] = useState('all')
  const [exchangeReturnSearchTerm, setExchangeReturnSearchTerm] = useState('')
  const [exchangeReturnFilterOpen, setExchangeReturnFilterOpen] = useState(false)
  
  const confirmModal = useConfirmModal()
  const alertModal = useAlertModal()

  useEffect(() => {
    dispatch(fetchAllOrdersThunk('orderDate'))
    dispatch(getAllExchangeReturnsThunk())
      .unwrap()
      .catch(() => {})
  }, [dispatch])

  const filteredOrders = useMemo(() => {
    // orders가 배열이 아니면 빈 배열 반환
    if (!Array.isArray(orders)) {
      return []
    }

    let filtered = orders

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.orderStatus === statusFilter)
    }

    // 검색어 필터
    if (searchTerm.trim()) {
      const search = searchTerm.trim().toLowerCase()
      filtered = filtered.filter((order) => {
        const orderId = String(order.id || '').toLowerCase()
        const userName = (order.User?.name || '').toLowerCase()
        const address = (order.delivery?.address || '').toLowerCase()
        const phone = (order.delivery?.phone || '').toLowerCase()
        return orderId.includes(search) || userName.includes(search) || address.includes(search) || phone.includes(search)
      })
    }

    return filtered
  }, [orders, statusFilter, searchTerm])

  const filteredExchangeReturns = useMemo(() => {
    if (!Array.isArray(allExchangeReturns)) {
      return []
    }

    let filtered = allExchangeReturns

    // 상태 필터
    if (exchangeReturnStatusFilter !== 'all') {
      filtered = filtered.filter((er) => er.status === exchangeReturnStatusFilter)
    }

    // 유형 필터
    if (exchangeReturnTypeFilter !== 'all') {
      filtered = filtered.filter((er) => er.type === exchangeReturnTypeFilter)
    }

    // 검색어 필터
    if (exchangeReturnSearchTerm.trim()) {
      const search = exchangeReturnSearchTerm.trim().toLowerCase()
      filtered = filtered.filter((er) => {
        const orderId = String(er.orderId || er.Order?.id || '').toLowerCase()
        const userName = (er.User?.name || '').toLowerCase()
        const reason = (er.reason || '').toLowerCase()
        return orderId.includes(search) || userName.includes(search) || reason.includes(search)
      })
    }

    return filtered
  }, [allExchangeReturns, exchangeReturnStatusFilter, exchangeReturnTypeFilter, exchangeReturnSearchTerm])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatusThunk({ orderId, status: newStatus })).unwrap()
      alertModal.open({
        title: '완료',
        message: '주문 상태가 변경되었습니다.',
        variant: 'success',
      })
      dispatch(fetchAllOrdersThunk('orderDate'))
    } catch (error) {
      alertModal.open({
        title: '오류',
        message: '주문 상태 변경 중 오류가 발생했습니다.',
        variant: 'danger',
      })
    }
  }

  const handleFilterSearch = (e) => {
    e.preventDefault()
  }

  const handleFilterReset = () => {
    setStatusFilter('all')
    setSearchTerm('')
  }

  const handleExchangeReturnFilterReset = () => {
    setExchangeReturnStatusFilter('all')
    setExchangeReturnTypeFilter('all')
    setExchangeReturnSearchTerm('')
  }

  const handleOrderCancel = async (orderId) => {
    confirmModal.open({
      title: '주문 취소 확인',
      message: '정말 주문을 취소하시겠습니까?',
      confirmText: '취소',
      cancelText: '돌아가기',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await dispatch(cancelOrderThunk(orderId)).unwrap()
          alertModal.open({
            title: '완료',
            message: '주문이 취소되었습니다.',
            variant: 'success',
          })
          dispatch(fetchAllOrdersThunk('orderDate'))
        } catch (error) {
          alertModal.open({
            title: '오류',
            message: `주문 취소 중 에러가 발생했습니다: ${error?.message || error}`,
            variant: 'danger',
          })
        }
      },
    })
  }

  const apiBase = import.meta.env.VITE_APP_API_URL || ''

  if (loading && activeTab === 'orders') {
    return (
      <AdminPanelLayout title="주문 관리">
        <Spinner text="주문 내역을 불러오는 중..." />
      </AdminPanelLayout>
    )
  }

  if (error && activeTab === 'orders') {
    return (
      <AdminPanelLayout title="주문 관리">
        <div className="alert alert-warning" role="alert">
          에러 발생: {error}
        </div>
      </AdminPanelLayout>
    )
  }

  const tabs = [
    {
      id: 'orders',
      label: '주문',
      badge: orders.length > 0 ? orders.length : null,
      badgeVariant: 'secondary',
    },
    {
      id: 'exchangeReturns',
      label: '교환/반품',
      badge: allExchangeReturns.filter(er => er.status === 'PENDING').length > 0 
         ? allExchangeReturns.filter(er => er.status === 'PENDING').length 
         : null,
      badgeVariant: 'danger',
    },
  ]

  return (
    <AdminPanelLayout title="주문 관리">
      {/* 탭 네비게이션 */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 주문 관리 탭 */}
      {activeTab === 'orders' && (
        <>
      <SectionCard
        title="주문 필터"
        className="section-card--overflow-visible"
        collapsible
        isOpen={filterOpen}
        headerActions={
          <button
            type="button"
            className="filter-form__toggle btn btn-link p-0 text-white"
            onClick={() => setFilterOpen((prev) => !prev)}
            aria-expanded={filterOpen}
            aria-label="필터 토글"
          >
          <Icon icon="mdi:tune-variant" width="24" height="24" style={{ color: 'white' }}/>
          </button>
        }
      >
        {filterOpen && (
          <FilterForm
            statusOptions={[
              { value: 'all', label: '전체' },
              ...ORDER_STATUS_OPTIONS,
            ]}
            values={{ q: searchTerm, status: statusFilter }}
            onChange={{ setQ: setSearchTerm, setStatus: setStatusFilter }}
            onSearch={handleFilterSearch}
            onReset={handleFilterReset}
            showSearch
            showStatus
            variant="admin"
          />
        )}
      </SectionCard>

      <div className="row align-items-center gx-3 gy-2 mt-3 mb-4">
        <div className="col-auto">
          <p className="item-count mb-0">주문 {filteredOrders.length}건</p>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="alert alert-secondary bg-transparent border-0" role="status">
          주문 내역이 없습니다.
        </div>
      ) : (
        <div className="row g-4">
          {filteredOrders.map((order) => {
            return (
              <div key={order.id} className="col-12 col-md-6">
                <div className="order-panel-card">
                  {/* 요약 정보 */}
                  <div className="order-panel-summary p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold">주문번호: {order.id}</div>
                        <div className="small text-muted">{order.orderDate?.slice(0, 10) ?? ''}</div>
                        <div className="small mt-1">
                          {order.User?.name || '익명'} · {order.orderPrice?.toLocaleString() || 0}원
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end gap-2">
                        <div className="d-flex gap-1 flex-wrap justify-content-end">
                          <span className={`badge bg-${order.orderStatus === 'CANCEL' ? 'danger' : 'primary'}`}>
                            {getOrderStatusLabel(order.orderStatus)}
                          </span>
                          {order.orderStatus === 'DELIVERED' && order.isPurchaseConfirmed && (
                            <span className="badge bg-success">구매 확정</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => {
                            setSelectedOrder(order)
                            setShowOrderDetailModal(true)
                          }}
                        >
                          상세보기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
        </>
      )}

      {/* 교환/반품 관리 탭 */}
      {activeTab === 'exchangeReturns' && (
        <>
          {exchangeReturnLoading ? (
            <div className="text-center py-5">
              <Spinner text="교환/반품 신청 목록을 불러오는 중..." />
            </div>
          ) : exchangeReturnError ? (
            <div className="alert alert-danger">
              교환/반품 신청 목록을 불러오는 중 오류가 발생했습니다: {exchangeReturnError}
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => dispatch(getAllExchangeReturnsThunk())}
              >
                다시 시도
              </Button>
            </div>
          ) : (
            <>
              <SectionCard
                title="교환/반품 필터"
                className="section-card--overflow-visible"
                collapsible
                isOpen={exchangeReturnFilterOpen}
                headerActions={
                  <button
                    type="button"
                    className="filter-form__toggle btn btn-link p-0 text-white"
                    onClick={() => setExchangeReturnFilterOpen((prev) => !prev)}
                    aria-expanded={exchangeReturnFilterOpen}
                    aria-label="필터 토글"
                  >
                    <Icon icon="mdi:tune-variant" width="24" height="24" style={{ color: 'white' }}/>
                  </button>
                }
              >
                {exchangeReturnFilterOpen && (
                  <FilterForm
                    statusOptions={EXCHANGE_RETURN_STATUS_OPTIONS}
                    tagOptions={EXCHANGE_RETURN_TYPE_OPTIONS}
                    values={{ 
                      q: exchangeReturnSearchTerm, 
                      status: exchangeReturnStatusFilter,
                      tag: exchangeReturnTypeFilter
                    }}
                    onChange={{ 
                      setQ: setExchangeReturnSearchTerm, 
                      setStatus: setExchangeReturnStatusFilter,
                      setTag: setExchangeReturnTypeFilter
                    }}
                    onSearch={handleFilterSearch}
                    onReset={handleExchangeReturnFilterReset}
                    showSearch
                    showStatus
                    showTag
                    variant="admin"
                  />
                )}
              </SectionCard>

              <div className="row align-items-center gx-3 gy-2 mt-3 mb-4">
                <div className="col-auto">
                  <p className="item-count mb-0">교환/반품 신청 {filteredExchangeReturns.length}건</p>
                </div>
                {allExchangeReturns.length > 0 && (
                  <>
                    <div className="col-auto">
                      <p className="item-count mb-0 text-warning">
                        대기중: {allExchangeReturns.filter(er => er.status === 'PENDING').length}건
                      </p>
                    </div>
                    <div className="col-auto">
                      <p className="item-count mb-0 text-success">
                        승인됨: {allExchangeReturns.filter(er => er.status === 'APPROVED').length}건
                      </p>
                    </div>
                  </>
                )}
              </div>

              {filteredExchangeReturns.length === 0 ? (
                <div className="alert alert-info mb-0">
                  현재 교환/반품 신청이 없습니다.
                </div>
              ) : (
                <div className="row g-3">
                  {filteredExchangeReturns.map((er) => {
                    const statusLabels = {
                      PENDING: '대기중',
                      APPROVED: '승인됨',
                      REJECTED: '거부됨',
                      COMPLETED: '완료됨',
                    }
                    const statusColors = {
                      PENDING: 'warning',
                      APPROVED: 'success',
                      REJECTED: 'danger',
                      COMPLETED: 'info',
                    }
                    return (
                      <div key={er.id} className="col-12">
                        <div className={`p-3 border rounded ${er.status === 'PENDING' ? 'border-warning border-2' : ''}`}>
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <div className="fw-semibold">
                                주문번호: {er.orderId || er.Order?.id || '-'}
                              </div>
                              <div className="small text-muted">
                                신청일: {er.createdAt?.slice(0, 10) || '-'}
                              </div>
                              <div className="small">
                                신청자: {er.User?.name || '-'}
                              </div>
                            </div>
                            <span className={`badge bg-${statusColors[er.status]}`}>
                              {er.type === 'EXCHANGE' ? '교환' : '반품'} - {statusLabels[er.status]}
                            </span>
                          </div>
                          {er.reason && (
                            <div className="mb-2">
                              <strong className="small">사유:</strong>
                              <div className="small text-muted">{er.reason}</div>
                            </div>
                          )}
                          {er.adminComment && (
                            <div className="mb-2">
                              <strong className="small">관리자 답변:</strong>
                              <div className="small text-muted">{er.adminComment}</div>
                            </div>
                          )}
                          {er.status === 'PENDING' && (
                            <div className="d-flex gap-2 mt-2">
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => {
                                  confirmModal.open({
                                    title: '승인 확인',
                                    message: '승인하시겠습니까?',
                                    confirmText: '승인',
                                    cancelText: '취소',
                                    variant: 'success',
                                    onConfirm: async () => {
                                      try {
                                        await dispatch(updateExchangeReturnStatusThunk({ id: er.id, status: 'APPROVED' })).unwrap()
                                        dispatch(getAllExchangeReturnsThunk())
                                        alertModal.open({
                                          title: '완료',
                                          message: '승인되었습니다.',
                                          variant: 'success',
                                        })
                                      } catch (error) {
                                        alertModal.open({
                                          title: '오류',
                                          message: `승인 중 오류가 발생했습니다: ${error}`,
                                          variant: 'danger',
                                        })
                                      }
                                    },
                                  })
                                }}
                              >
                                승인
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => {
                                  setRejectingExchangeReturnId(er.id)
                                  setRejectComment('')
                                  setShowRejectModal(true)
                                }}
                              >
                                거부
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* 주문 상세 모달 */}
      <Modal
        open={showOrderDetailModal}
        onClose={() => {
          setShowOrderDetailModal(false)
          setSelectedOrder(null)
        }}
        title={`주문 상세보기 - 주문번호: ${selectedOrder?.id || ''}`}
        size="lg"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowOrderDetailModal(false)
                setSelectedOrder(null)
              }}
            >
              닫기
            </Button>
          </div>
        }
      >
        {selectedOrder && (() => {
          const fullAddress = [
            selectedOrder.delivery?.address || selectedOrder.User?.address || '',
            selectedOrder.delivery?.addressDetail || selectedOrder.User?.addressDetail || '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <div className="row g-3">
              {/* 주문 정보 */}
              <div className="col-12">
                <div className="order-panel-info p-3 rounded">
                  <div className="row g-2">
                    <div className="col-4 col-sm-3 fw-semibold small">주문번호</div>
                    <div className="col-8 col-sm-9 small">{selectedOrder.id}</div>
                    
                    <div className="col-4 col-sm-3 fw-semibold small">주문일자</div>
                    <div className="col-8 col-sm-9 small">{selectedOrder.orderDate?.slice(0, 10) ?? ''}</div>
                    
                    <div className="col-4 col-sm-3 fw-semibold small">주문자</div>
                    <div className="col-8 col-sm-9 small">{selectedOrder.User?.name || '익명'}</div>
                    
                    <div className="col-4 col-sm-3 fw-semibold small">수령인</div>
                    <div className="col-8 col-sm-9 small">{selectedOrder.delivery?.name || selectedOrder.User?.name || '-'}</div>
                    
                    <div className="col-4 col-sm-3 fw-semibold small">연락처</div>
                    <div className="col-8 col-sm-9 small">{selectedOrder.delivery?.phone || selectedOrder.User?.phoneNumber || '-'}</div>
                    
                    <div className="col-4 col-sm-3 fw-semibold small">배송지</div>
                    <div className="col-8 col-sm-9 small">{fullAddress || '-'}</div>
                    
                    {selectedOrder.delivery?.request && (
                      <>
                        <div className="col-4 col-sm-3 fw-semibold small">배송 요청</div>
                        <div className="col-8 col-sm-9 small">{selectedOrder.delivery.request}</div>
                      </>
                    )}
                    
                    <div className="col-4 col-sm-3 fw-semibold small">총 금액</div>
                    <div className="col-8 col-sm-9 small">
                      <strong>{selectedOrder.orderPrice?.toLocaleString() || 0}원</strong>
                    </div>
                        
                    {selectedOrder.orderStatus === 'DELIVERED' && (
                      <>
                        <div className="col-4 col-sm-3 fw-semibold small">구매 확정</div>
                        <div className="col-8 col-sm-9 small">
                          {selectedOrder.isPurchaseConfirmed ? (
                            <span className="badge bg-success">확정됨</span>
                          ) : (
                            <span className="badge bg-secondary">미확정</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 상품 목록 */}
              <div className="col-12">
                <div className="order-panel-items p-3 rounded">
                  <div className="row g-2 mb-2 fw-semibold small">
                    <div className="col-6">상품명</div>
                    <div className="col-3 text-center">수량</div>
                    <div className="col-3 text-end">가격</div>
                  </div>
                  {selectedOrder.Items && Array.isArray(selectedOrder.Items) && selectedOrder.Items.length > 0 ? (
                    selectedOrder.Items.map((item) => (
                      <div key={item.id || item.itemId} className="row g-2 small">
                        <div className="col-6">{item.itemNm || '-'}</div>
                        <div className="col-3 text-center">{item.OrderItem?.count || item.count || 0}개</div>
                        <div className="col-3 text-end">{(item.OrderItem?.orderPrice || item.orderPrice || 0).toLocaleString()}원</div>
                      </div>
                    ))
                  ) : (
                    <div className="row g-2 small text-muted">
                      <div className="col-12 text-center">상품 정보가 없습니다.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 액션 영역 */}
              <div className="col-12">
                <div className="order-panel-actions">
                  <div className="d-flex flex-column gap-2">
                    <div>
                      <label className="form-label small mb-1">주문 상태</label>
                      <Selector
                        value={selectedOrder.orderStatus}
                        onChange={(newStatus) => {
                          handleStatusChange(selectedOrder.id, newStatus)
                          setShowOrderDetailModal(false)
                          setSelectedOrder(null)
                        }}
                        options={ORDER_STATUS_OPTIONS}
                        placeholder="상태 선택"
                      />
                    </div>
                    
                    {/* 주문 액션 버튼 */}
                    <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-2">
                      {selectedOrder.orderStatus === 'ORDER' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            handleOrderCancel(selectedOrder.id)
                            setShowOrderDetailModal(false)
                            setSelectedOrder(null)
                          }}
                        >
                          주문 취소
                        </Button>
                      )}
                      {selectedOrder.orderStatus === 'SHIPPED' && (
                        <Button variant="outline" size="sm">배송 조회</Button>
                      )}
                      {selectedOrder.orderStatus === 'DELIVERED' && !selectedOrder.isPurchaseConfirmed && (
                        <span className="badge bg-secondary small">구매 미확정</span>
                      )}
                      {selectedOrder.orderStatus === 'DELIVERED' && selectedOrder.isPurchaseConfirmed && (
                        <span className="badge bg-success small">구매 확정</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </Modal>

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
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
      <Modal
        open={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setRejectComment('')
          setRejectingExchangeReturnId(null)
        }}
        title="거부 사유 입력"
        size="md"
        footer={
          <div className="d-flex gap-2 justify-content-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowRejectModal(false)
                setRejectComment('')
                setRejectingExchangeReturnId(null)
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                if (!rejectComment.trim()) {
                  alertModal.open({
                    title: '입력 필요',
                    message: '거부 사유를 입력해주세요.',
                    variant: 'warning',
                  })
                  return
                }
                if (rejectingExchangeReturnId) {
                  confirmModal.open({
                    title: '거부 확인',
                    message: `거부 사유: ${rejectComment}\n\n거부하시겠습니까?`,
                    confirmText: '거부',
                    cancelText: '취소',
                    variant: 'danger',
                    onConfirm: async () => {
                      try {
                        await dispatch(updateExchangeReturnStatusThunk({ id: rejectingExchangeReturnId, status: 'REJECTED', adminComment: rejectComment })).unwrap()
                        dispatch(getAllExchangeReturnsThunk())
                        setShowRejectModal(false)
                        setRejectComment('')
                        setRejectingExchangeReturnId(null)
                        alertModal.open({
                          title: '완료',
                          message: '거부되었습니다.',
                          variant: 'success',
                        })
                      } catch (error) {
                        alertModal.open({
                          title: '오류',
                          message: `거부 중 오류가 발생했습니다: ${error}`,
                          variant: 'danger',
                        })
                      }
                    },
                  })
                }
              }}
            >
              거부하기
            </Button>
          </div>
        }
      >
        <Input
          as="textarea"
          label="거부 사유"
          placeholder="거부 사유를 입력하세요"
          value={rejectComment}
          onChange={setRejectComment}
          rows={4}
          required
        />
      </Modal>
    </AdminPanelLayout>
  )
}

export default OrderPanel
