import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'

import { fetchNewReviewsThunk, getUserReviewThunk, deleteReviewThunk } from '../../features/reviewSlice'
import { Button, Spinner, PageHeader, Pagination, AlertModal, ConfirmModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import ReviewItem from '../../components/review/ReviewItem'
import useAppBackground from '../../hooks/useAppBackground'

/**
 * 통합 리뷰 목록 페이지
 * - type: 'all' | 'my' | 'item' (기본: 'all')
 * - itemId: 상품별 리뷰 조회 시 사용
 */
export default function ReviewListPage() {
  useAppBackground('app-bg--dots')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { alertModal, confirmModal } = useModalHelpers()
  const [searchParams] = useSearchParams()
  
  const type = searchParams.get('type') || 'all' // all | my | item
  const itemId = searchParams.get('itemId')
  
  const reviewState = useSelector((state) => state.review)
  const [page, setPage] = useState(1)
  const LIMIT = 10

  // 데이터 로딩
  useEffect(() => {
    if (type === 'my') {
      dispatch(getUserReviewThunk({ page, limit: LIMIT }))
    } else {
      dispatch(fetchNewReviewsThunk({ page, size: LIMIT }))
    }
  }, [dispatch, page, type])

  const reviewList = useMemo(() => {
    if (type === 'my') {
      return Array.isArray(reviewState.reviews) ? reviewState.reviews : []
    } else {
      return Array.isArray(reviewState.list) ? reviewState.list : []
    }
  }, [type, reviewState.reviews, reviewState.list])

  const loading = type === 'my' ? reviewState.loading : reviewState.listLoading
  const error = type === 'my' ? reviewState.error : reviewState.listError
  const pagination = reviewState.pagination

  const handleReviewDelete = (id) => {
    confirmModal.open({
      title: '삭제 확인',
      message: '정말 삭제하시겠습니까?',
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      onConfirm: () => {
        dispatch(deleteReviewThunk(id))
          .unwrap()
          .then(() => {
            alertModal.open({
              title: '완료',
              message: '후기를 삭제했습니다!',
              variant: 'success',
            })
            dispatch(getUserReviewThunk({ page, limit: LIMIT }))
          })
          .catch((error) => {
            alertModal.open({
              title: '오류',
              message: `후기 삭제에 실패했습니다: ${error}`,
              variant: 'danger',
            })
          })
      },
    })
  }

  const getPageTitle = () => {
    if (type === 'my') return '나의 리뷰'
    if (type === 'item') return '상품 리뷰'
    return 'Best Review'
  }

  const getEmptyMessage = () => {
    if (type === 'my') return '작성한 리뷰가 없습니다.'
    return '등록된 리뷰가 없습니다.'
  }

  if (loading) {
    return (
      <section className="container py-5">
        <Spinner fullPage text="리뷰 목록을 불러오는 중..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="container py-5">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <Icon icon="bi:exclamation-triangle-fill" width="24" height="24" className="me-2" />
          <div>
            <strong>오류가 발생했습니다!</strong> {error}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container py-5">
      {type === 'my' && <PageHeader title={getPageTitle()} onBack={() => navigate(-1)} className="mb-4" />}
      
      {type !== 'my' && (
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h2 className="display-5 fw-bold mb-2">{getPageTitle()}</h2>
            <p className="text-muted">최고의 리뷰를 확인해보세요</p>
          </div>
        </div>
      )}

      {reviewList.length === 0 ? (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-info text-center py-5" role="alert">
              <Icon icon="bi:inbox" width="48" height="48" className="mb-3" />
              <h5 className="mb-2">{getEmptyMessage()}</h5>
              {type === 'my' ? (
                <Link to="/myorderlist">
                  <Button variant="primary" className="mt-3">주문 내역에서 리뷰 작성하기</Button>
                </Link>
              ) : (
                <p className="text-muted mb-0">첫 번째 리뷰를 작성해보세요!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 g-md-4">
            {reviewList.map((r, i) => (
              <div key={r?.id ?? `review-${i}`} className="col-12 col-sm-6 col-xl-4">
                <ReviewItem
                  review={r}
                  variant="card"
                  showActions={type === 'my'}
                  actions={
                    type === 'my' ? (
                      <>
                        <Link to={`/review/edit/${r.id}`} state={{ review: r }}>
                          <Button variant="outline" size="sm">수정</Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReviewDelete(r.id)}
                        >
                          삭제
                        </Button>
                      </>
                    ) : null
                  }
                />
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {reviewList.length > 0 && (
            <Pagination
              currentPage={pagination?.currentPage ?? page}
              totalPages={pagination?.totalPages ?? 1}
              onPageChange={(newPage) => setPage(newPage)}
              className="mt-4"
            />
          )}
        </>
      )}
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

