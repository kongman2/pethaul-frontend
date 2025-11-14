import { useMemo, memo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

import './MenuBar.scss'
import { SectionCard, Spinner } from '../../common'
import { getMyExchangeReturnsThunk } from '../../../features/exchangeReturnSlice'

const MenuBar = memo(function MenuBar({ id, isGuest }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { reviews, loading: reviewLoading, error: reviewError } = useSelector((state) => state.review)
  const { orders, loading: orderLoading, error: orderError } = useSelector((state) => state.order)
  const { myExchangeReturns = [], loading: exchangeReturnLoading } = useSelector((state) => state.exchangeReturn || {})
  
  const totalOrders = Array.isArray(orders) ? orders.length : 0
  const cancelledOrders = Array.isArray(orders) ? orders.filter((o) => o.orderStatus === 'CANCEL').length : 0
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0
  const totalExchangeReturns = Array.isArray(myExchangeReturns) ? myExchangeReturns.length : 0

  // 교환/반품 목록 로드
  useEffect(() => {
    if (!isGuest && id) {
      dispatch(getMyExchangeReturnsThunk())
    }
  }, [dispatch, id, isGuest])

  const stats = useMemo(
    () => [
      {
        key: 'orders',
        label: '주문',
        value: totalOrders,
        onClick: () => navigate('/myorderlist'),
      },
      {
        key: 'exchangeReturn',
        label: '취소',
        value: totalExchangeReturns,
        onClick: () => navigate('/myexchangereturnlist'),
      },
      {
        key: 'review',
        label: '리뷰',
        value: totalReviews,
        onClick: () => navigate('/myreviewlist'),
      },
      {
        key: 'qna',
        label: '1:1 문의',
        value: totalOrders,
        onClick: () => navigate('/myQnAlist'),
      },
    ],
    [navigate, totalOrders, totalExchangeReturns, totalReviews]
  )

  if (isGuest) {
    return <p className="mypage-menu__empty text-center text-muted mb-0">로그인 후 이용 가능한 메뉴입니다.</p>
  }

  if (reviewLoading || orderLoading || exchangeReturnLoading) return <Spinner size="sm" text="메뉴 정보를 불러오는 중..." />
  if (reviewError || orderError) return <p className="text-center text-danger mb-0">에러 발생: {reviewError || orderError}</p>

  return (
    <div className="mt-4 row g-3">
      {stats.map((stat) => (
        <div className="col-12 col-md-6 col-lg-3 h-100" key={stat.key}>
          <SectionCard
            className="mypage-menu__card"
            title={stat.label}
            headerActions={
              <button
                type="button"
                className="mypage-menu__header-action"
                onClick={stat.onClick}
                disabled={!stat.onClick}
                aria-label={`${stat.label} 바로가기`}
              >
                <Icon icon="pixel:angle-right" width={24} height={24} color="#ffffff" />
              </button>
            }
          >
            <button
              type="button"
              className="mypage-menu__button"
              onClick={stat.onClick}
              disabled={!stat.onClick}
            >
              <span className="mypage-menu__value">{stat.value ?? 0}</span>
            </button>
          </SectionCard>
        </div>
      ))}
    </div>
  )
})

export default MenuBar
