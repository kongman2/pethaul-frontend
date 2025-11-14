import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'

import { SectionCard, Button, Spinner, PageHeader } from '../../components/common'
import { buildImageUrl } from '../../utils/imageUtils'
import useAppBackground from '../../hooks/useAppBackground'
import './ReviewDetailPage.scss'

export default function ReviewDetailPage() {
  useAppBackground('app-bg--blue')
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  // location.state에서 review 데이터 가져오기
  const reviewFromState = location.state?.review
  const [review, setReview] = useState(reviewFromState)
  const [loading, setLoading] = useState(!reviewFromState)
  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const apiBase = import.meta.env.VITE_APP_API_URL || ''

  useEffect(() => {
    // state에 review가 없으면 API로 가져오기 (필요시)
    if (!review && id) {
      // TODO: API 호출 로직 추가 (필요한 경우)
      setLoading(false)
    }
  }, [id, review])

  if (loading) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <Spinner text="리뷰를 불러오는 중..." />
          </div>
        </div>
      </section>
    )
  }

  if (error || !review) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="alert alert-danger" role="alert">
              {error || '리뷰를 찾을 수 없습니다.'}
            </div>
            <div className="d-flex justify-content-center">
              <Button variant="outline" onClick={() => navigate('/reviews')}>
                목록으로
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const getImages = (r) => r?.ReviewImages || r?.images || r?.imageUrls || []
  const getRating = (r) => {
    const v = Number(r?.rating ?? r?.score ?? 0)
    return Number.isFinite(v) ? Math.max(0, Math.min(5, v)) : 0
  }
  const getName = (r) => r?.User?.name ?? r?.userName ?? '익명'
  const getDate = (r) => (r?.reviewDate ?? r?.createdAt ?? '').slice(0, 10)
  const getText = (r) => r?.reviewContent ?? r?.content ?? r?.text ?? ''
  const getItemName = (r) => r?.Item?.itemNm ?? '상품명'
  const getItemPrice = (r) => r?.Item?.price ?? null

  const imgs = getImages(review)
  const rating = getRating(review)
  const stars = Math.round(rating)
  const imageUrls = imgs.map((img) => 
    typeof img === 'string' ? buildImageUrl(img) : buildImageUrl(img?.imgUrl || '')
  ).filter(Boolean)

  return (
    <section className="container py-5 review-detail-page">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <PageHeader
            title="리뷰 상세"
            onBack={() => navigate(-1)}
            className="mb-4"
          />

          <SectionCard 
            title={getItemName(review)}
            className="mb-4"
            bodyClassName="p-4"
          >
            {/* 메타 정보 */}
            <div className="d-flex flex-wrap align-items-center gap-3 mb-4 pb-3 border-bottom">
              {/* 별점 */}
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Icon
                      key={n}
                      icon={n <= stars ? "pixel:star-solid" : "pixel:star"}
                      width="20"
                      height="20"
                      style={{ color: n <= stars ? '#ffbf00' : '#ddd' }}
                    />
                  ))}
                </div>
                <span className="fw-semibold">{rating}/5</span>
              </div>

              {/* 작성자 및 날짜 */}
              <div className="d-flex align-items-center gap-2 text-muted small">
                <Icon icon="bi:person-fill" width="16" height="16" />
                <strong>{getName(review)}</strong>
                <span>·</span>
                <Icon icon="bi:calendar3" width="16" height="16" />
                <time dateTime={getDate(review)}>{getDate(review)}</time>
              </div>

              {/* 상품 가격 */}
              {getItemPrice(review) && (
                <div className="ms-auto">
                  <span className="badge bg-primary">
                    {getItemPrice(review).toLocaleString()}원
                  </span>
                </div>
              )}
            </div>

            {/* 이미지 갤러리 */}
            {imageUrls.length > 0 && (
              <div className="mb-4">
                <div className="row g-3">
                  {/* 메인 이미지 */}
                  <div className="col-12">
                    <div className="review-detail__main-image position-relative">
                      <img
                        src={imageUrls[selectedImageIndex]}
                        alt={`리뷰 이미지 ${selectedImageIndex + 1}`}
                        className="img-fluid rounded w-100"
                        style={{ maxHeight: '500px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                      />
                      {imageUrls.length > 1 && (
                        <div className="position-absolute top-0 end-0 m-2">
                          <span className="badge bg-dark">
                            {selectedImageIndex + 1} / {imageUrls.length}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 썸네일 목록 */}
                  {imageUrls.length > 1 && (
                    <div className="col-12">
                      <div className="d-flex gap-2 flex-wrap">
                        {imageUrls.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className={`review-detail__thumb ${selectedImageIndex === idx ? 'active' : ''}`}
                            onClick={() => setSelectedImageIndex(idx)}
                            style={{
                              border: selectedImageIndex === idx ? '3px solid #007bff' : '2px solid #dee2e6',
                              borderRadius: '8px',
                              padding: '4px',
                              background: 'white',
                              cursor: 'pointer',
                            }}
                          >
                            <img
                              src={url}
                              alt={`썸네일 ${idx + 1}`}
                              style={{
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 리뷰 내용 */}
            <div className="mb-4">
              <h6 className="mb-3">리뷰 내용</h6>
              <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
                {getText(review)}
              </p>
            </div>

            {/* 액션 버튼 */}
            <div className="d-flex gap-2 pt-3 border-top">
              <Button 
                variant="outline" 
                onClick={() => navigate('/reviews')}
                icon={<Icon icon="bi:arrow-left" width="16" height="16" />}
              >
                목록으로
              </Button>
              {review.Item?.id && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/items/detail/${review.Item.id}`)}
                >
                  상품 보기
                </Button>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}

