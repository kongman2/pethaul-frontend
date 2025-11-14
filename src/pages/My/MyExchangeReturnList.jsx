import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { getMyExchangeReturnsThunk } from '../../features/exchangeReturnSlice'
import { fetchOrdersThunk } from '../../features/orderSlice'
import { SectionCard, Button, Spinner, PageHeader, Tabs } from '../../components/common'
import useAppBackground from '../../hooks/useAppBackground'
import './MyExchangeReturnList.scss'

const STATUS_LABELS = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  REJECTED: '거부됨',
  COMPLETED: '완료됨',
}

const STATUS_COLORS = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  COMPLETED: 'info',
}

function MyExchangeReturnList() {
  useAppBackground('app-bg--blue')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { myExchangeReturns = [], loading, error } = useSelector((state) => state.exchangeReturn || {})
  const { orders = [] } = useSelector((state) => state.order || {})
  const [activeTab, setActiveTab] = useState('exchangeReturns') // 'exchangeReturns' or 'cancelled'
  const [expandedExchangeReturns, setExpandedExchangeReturns] = useState(new Set())
  const [expandedCancelledOrders, setExpandedCancelledOrders] = useState(new Set())

  useEffect(() => {
    dispatch(getMyExchangeReturnsThunk())
    dispatch(fetchOrdersThunk({ page: 1, limit: 100 }))
  }, [dispatch])

  const sortedExchangeReturns = useMemo(() => {
    return [...myExchangeReturns].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0)
      const dateB = new Date(b.createdAt || 0)
      return dateB - dateA
    })
  }, [myExchangeReturns])

  const cancelledOrders = useMemo(() => {
    return [...orders]
      .filter((order) => order.orderStatus === 'CANCEL')
      .sort((a, b) => {
        const dateA = new Date(a.orderDate || 0)
        const dateB = new Date(b.orderDate || 0)
        return dateB - dateA
      })
  }, [orders])

  if (loading) {
    return (
      <section className="container py-5">
        <Spinner fullPage text="교환/반품 신청 목록을 불러오는 중..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="container py-5">
        <PageHeader title="교환/반품 신청" onBack={() => navigate(-1)} className="mb-4" />
        <div className="alert alert-danger" role="alert">
          에러 발생: {error}
        </div>
      </section>
    )
  }

  return (
    <section className="container py-5">
      <PageHeader title="교환/반품 및 취소 목록" onBack={() => navigate(-1)} className="mb-4" />

      {/* 탭 네비게이션 */}
      <Tabs
        tabs={[
          {
            id: 'exchangeReturns',
            label: '교환/반품 신청',
            badge: sortedExchangeReturns.length > 0 ? sortedExchangeReturns.length : null,
            badgeVariant: 'secondary',
          },
          {
            id: 'cancelled',
            label: '취소 내역',
            badge: cancelledOrders.length > 0 ? cancelledOrders.length : null,
            badgeVariant: 'danger',
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 교환/반품 신청 탭 */}
      {activeTab === 'exchangeReturns' && (
        <>
          {sortedExchangeReturns.length > 0 ? (
            <div className="row g-3 mt-3">
              {sortedExchangeReturns.map((er) => {
            const orderPrice = er.Order?.orderPrice || 0
            // 상품명 추출 (첫 번째 상품명 또는 여러 개일 경우 "외 N개" 표시)
            const items = er.Order?.Items || []
            const firstItemName = items.length > 0 ? items[0]?.itemNm || '상품명 없음' : '상품명 없음'
            const itemCount = items.length
            const itemNameDisplay = itemCount > 1 
              ? `${firstItemName} 외 ${itemCount - 1}개`
              : firstItemName
            
            const isExpanded = expandedExchangeReturns.has(er.id)
            const toggleExpand = () => {
              setExpandedExchangeReturns((prev) => {
                const next = new Set(prev)
                if (next.has(er.id)) {
                  next.delete(er.id)
                } else {
                  next.add(er.id)
                }
                return next
              })
            }
            
            return (
              <div key={er.id} className="col-12">
                <SectionCard
                  title={
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <div className="d-flex flex-row" >
                        <div className="fw-semibold">{itemNameDisplay}</div>
                      </div>
                      <span className={`badge bg-${STATUS_COLORS[er.status]} ms-2`}>
                        {er.type === 'EXCHANGE' ? '교환' : '반품'} - {STATUS_LABELS[er.status]}
                      </span>
                    </div>
                  }
                  headerActions={
                    <div className="d-flex gap-2 align-items-center">
                    <div className="small">
                        {er.createdAt?.slice(0, 10) || '-'}
                      </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light"
                      onClick={toggleExpand}
                      aria-expanded={isExpanded}
                    >
                      {isExpanded ? '접기' : '상세보기'}
                    </button>
                    </div>

                  }
                  collapsible
                  isOpen={isExpanded}
                >
                  {isExpanded && (
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <div className="exchange-return-info">
                          {er.Order && (
                            <>
                              <div className="mb-2">
                                <strong className="small">주문일자:</strong>
                                <span className="ms-2 small text-muted">
                                  {er.Order.orderDate?.slice(0, 10) || '-'}
                                </span>
                              </div>
                              <div className="mb-2">
                                <strong className="small">주문 금액:</strong>
                                <span className="ms-2 small">
                                  {orderPrice.toLocaleString()}원
                                </span>
                              </div>
                              {er.Order.Items && Array.isArray(er.Order.Items) && er.Order.Items.length > 0 && (
                                <div className="mb-2">
                                  <strong className="small">주문 상품:</strong>
                                  <div className="ms-2 mt-1">
                                    {er.Order.Items.map((item, idx) => (
                                      <div key={item.id || idx} className="small text-muted">
                                        • {item.itemNm || '상품명 없음'} ({item.OrderItem?.count || 0}개)
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="mb-3">
                          <strong className="small d-block mb-1">신청 사유:</strong>
                          <div className="p-2 bg-light rounded small">{er.reason || '-'}</div>
                        </div>
                        {er.adminComment && (
                          <div className="mb-3">
                            <strong className="small d-block mb-1">관리자 답변:</strong>
                            <div className={`p-2 rounded small ${
                              er.status === 'APPROVED' 
                                ? 'bg-success bg-opacity-10 text-success' 
                                : er.status === 'REJECTED'
                                ? 'bg-danger bg-opacity-10 text-danger'
                                : 'bg-light'
                            }`}>
                              {er.adminComment}
                            </div>
                          </div>
                        )}
                        {er.status === 'PENDING' && (
                          <div className="alert alert-warning mb-0">
                            <small>관리자 검토 중입니다. 승인 또는 거부 결과를 기다려주세요.</small>
                          </div>
                        )}
                        {er.status === 'APPROVED' && (
                          <div className="alert alert-success mb-0">
                            <small>교환/반품 신청이 승인되었습니다. 처리 절차를 진행해주세요.</small>
                          </div>
                        )}
                        {er.status === 'REJECTED' && (
                          <div className="alert alert-danger mb-0">
                            <small>교환/반품 신청이 거부되었습니다. 위의 관리자 답변을 확인해주세요.</small>
                          </div>
                        )}
                        {er.status === 'COMPLETED' && (
                          <div className="alert alert-info mb-0">
                            <small>교환/반품 처리가 완료되었습니다.</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </SectionCard>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">교환/반품 신청 내역이 없습니다.</p>
          <Button variant="primary" className="mt-3" onClick={() => navigate('/myorderlist')}>
            주문 내역 보기
          </Button>
        </div>
      )}
        </>
      )}

      {/* 취소 내역 탭 */}
      {activeTab === 'cancelled' && (
        <>
          {cancelledOrders.length > 0 ? (
            <div className="row g-3 mt-3">
              {cancelledOrders.map((order) => {
                const apiBase = import.meta.env.VITE_APP_API_URL || ''
                const items = order.Items || []
                const firstItemName = items.length > 0 ? items[0]?.itemNm || '상품명 없음' : '상품명 없음'
                const itemCount = items.length
                const itemNameDisplay = itemCount > 1 
                  ? `${firstItemName} 외 ${itemCount - 1}개`
                  : firstItemName
                
                const isExpanded = expandedCancelledOrders.has(order.id)
                const toggleExpand = () => {
                  setExpandedCancelledOrders((prev) => {
                    const next = new Set(prev)
                    if (next.has(order.id)) {
                      next.delete(order.id)
                    } else {
                      next.add(order.id)
                    }
                    return next
                  })
                }
                
                return (
                  <div key={order.id} className="col-12">
                    <SectionCard
                      title={
                        <div className="d-flex justify-content-between align-items-center w-100">
                          <div>
                            <div className="fw-semibold">{itemNameDisplay}</div>
                            <div className="small text-muted mt-1">
                              주문일자: {order.orderDate?.slice(0, 10) || '-'} · 주문번호: {order.id}
                            </div>
                          </div>
                          <div className="d-flex gap-1 flex-wrap justify-content-end">
                            <span className="badge bg-secondary">취소완료</span>
                          </div>
                        </div>
                      }
                      headerActions={
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-light"
                          onClick={toggleExpand}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? '접기' : '상세보기'}
                        </button>
                      }
                      collapsible
                      isOpen={isExpanded}
                    >
                      {isExpanded && (
                        <div className="row g-3">
                          <div className="col-12 col-md-6">
                            <div className="mb-2">
                              <strong className="small">주문 금액:</strong>
                              <span className="ms-2 small">
                                {order.orderPrice?.toLocaleString() || 0}원
                              </span>
                            </div>
                            {order.Items && Array.isArray(order.Items) && order.Items.length > 0 && (
                              <div className="mb-2">
                                <strong className="small">주문 상품:</strong>
                                <div className="ms-2 mt-1">
                                  {order.Items.map((item, idx) => (
                                    <div key={item.id || idx} className="small text-muted">
                                      • {item.itemNm || '상품명 없음'} ({item.OrderItem?.count || 0}개)
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="col-12">
                            <div className="alert alert-secondary mb-0">
                              <small>이 주문은 취소되었습니다.</small>
                            </div>
                          </div>
                        </div>
                      )}
                    </SectionCard>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">취소된 주문 내역이 없습니다.</p>
              <Button variant="primary" className="mt-3" onClick={() => navigate('/myorderlist')}>
                주문 내역 보기
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default MyExchangeReturnList

