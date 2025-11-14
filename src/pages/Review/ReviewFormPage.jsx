import { useLocation, useParams, Link } from 'react-router-dom'
import ReviewForm from '../../components/review/ReviewForm'
import useAppBackground from '../../hooks/useAppBackground'

/*
 통합 리뷰 작성/수정 페이지
  - /review/create (state.item 필요)
  - /review/edit/:id (state.review 필요)
 */
function ReviewFormPage() {
  useAppBackground('app-bg--blue')
  const { id } = useParams()
  const { state } = useLocation()
  
  const isEdit = Boolean(id)
  const item = state?.item
  const review = state?.review

  // 수정 모드인데 review 데이터가 없는 경우
  if (isEdit && !review) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <h1 className="h3 mb-4">리뷰 수정</h1>
                <div className="alert alert-warning d-flex flex-column align-items-center" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mb-3">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="mb-0">리뷰 데이터가 없습니다. 목록에서 다시 진입해 주세요.</p>
                </div>
                <Link to="/myreviewlist" className="btn btn-primary btn-lg mt-3">
                  내 리뷰로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 생성 모드인데 item 데이터가 없는 경우
  if (!isEdit && !item) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card shadow-sm">
              <div className="card-body text-center py-5">
                <h1 className="h3 mb-4">리뷰 작성</h1>
                <div className="alert alert-warning d-flex flex-column align-items-center" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="mb-3">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <p className="mb-0">상품 정보가 없습니다. 이전 페이지에서 다시 시도해 주세요.</p>
                </div>
                <Link to="/" className="btn btn-primary btn-lg mt-3">
                  홈으로 돌아가기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 기존 이미지 URL 필드명이 다를 수 있어 안전하게 추출 (수정 모드)
  const existingImgs = isEdit && review
    ? (review?.images ?? 
       (Array.isArray(review?.ReviewImages) 
         ? review.ReviewImages.map((ri) => {
             // ri가 문자열이면 그대로, 객체면 imgUrl 또는 url 추출
             if (typeof ri === 'string') return ri
             return ri?.imgUrl || ri?.url || ri?.imageUrl || ''
           }).filter(Boolean)
         : []))
    : []
  

  return (
    <ReviewForm
      mode={isEdit ? 'edit' : 'create'}
      item={item}
      review={review}
      reviewId={id}
      existingImgs={existingImgs}
      onSuccess={isEdit ? '/' : '/myreviewlist'}
    />
  )
}

export default ReviewFormPage
