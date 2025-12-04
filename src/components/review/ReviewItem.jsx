import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { SectionCard } from '../common'
import { buildImageUrl } from '../../utils/imageUtils'
import {
  getReviewImages,
  getReviewFirstImage,
  getReviewRating,
  getReviewAuthor,
  getReviewDate,
  getReviewContent,
  getReviewItemName,
  getReviewItemPrice,
} from '../../utils/reviewUtils'
import './ReviewItem.scss'

/**
 * 공통 리뷰 아이템 컴포넌트
 * - variant: 'card' | 'list' | 'compact'
 * - showActions: 액션 버튼 표시 여부
 * - actions: 커스텀 액션 버튼
 * - onClick: 클릭 핸들러 (기본: 상세 페이지로 이동)
 */
export default function ReviewItem({
  review,
  variant = 'card',
  showActions = false,
  actions,
  onClick,
  className = '',
}) {
  const navigate = useNavigate()

  const imgs = getReviewImages(review)
  const firstImg = getReviewFirstImage(review)
  const rating = getReviewRating(review)
  const stars = Math.round(rating)
  const author = getReviewAuthor(review)
  const date = getReviewDate(review)
  const content = getReviewContent(review)
  const itemName = getReviewItemName(review)
  const price = getReviewItemPrice(review)

  const handleClick = onClick || (() => navigate(`/reviews/${review?.id}`, { state: { review } }))

  // Star Rating Component
  const StarRating = ({ size = 16 }) => (
    <div className="d-flex align-items-center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Icon
          key={n}
          icon={n <= stars ? "pixel:star-solid" : "pixel:star"}
          width={size}
          height={size}
          style={{ color: n <= stars ? '#ffbf00' : '#ddd' }}
        />
      ))}
    </div>
  )

  // List variant (ItemReviewList용)
  if (variant === 'list') {
    return (
      <div
        className={`border-bottom pb-3 ${className}`}
        style={{ cursor: 'pointer' }}
        onClick={handleClick}
      >
        <div className="row g-3">
          {firstImg && (
            <div className="col-auto position-relative">
              <img
                src={buildImageUrl(firstImg)}
                alt="리뷰 이미지"
                className="rounded"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                loading="lazy"
              />
              {imgs.length > 1 && (
                <span
                  className="badge bg-dark position-absolute top-0 end-0"
                  style={{ transform: 'translate(50%, -50%)' }}
                >
                  +{imgs.length - 1}
                </span>
              )}
            </div>
          )}

          <div className="col flex-grow-1">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <StarRating size={16} />
              <span className="small fw-semibold">{rating}/5</span>
              <span className="small text-muted">·</span>
              <span className="small fw-semibold">{author}</span>
              <span className="small text-muted">·</span>
              <span className="small text-muted">{date}</span>
            </div>
            <p className="mb-0 small" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {content || '내용이 없습니다.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Compact variant (ReviewSlider용) - 호버 효과 포함
  if (variant === 'compact') {
    return (
      <article 
        className="review-slide-compact position-relative w-100 h-100" 
        style={{ cursor: 'pointer', overflow: 'hidden', minHeight: '200px' }} 
        onClick={handleClick}
      >
        {/* 배경 이미지 */}
        {firstImg ? (
          <div className="review-slide-compact__image position-absolute w-100 h-100">
            <img
              src={buildImageUrl(firstImg)}
              alt="리뷰 이미지"
              className="w-100 h-100"
              style={{ objectFit: 'cover' }}
              loading="lazy"
            />
            {imgs.length > 1 && (
              <span className="badge bg-dark position-absolute top-0 end-0 m-2">
                +{imgs.length - 1}
              </span>
            )}
          </div>
        ) : (
          <div className="review-slide-compact__image position-absolute w-100 h-100 bg-secondary" />
        )}

        {/* 기본 정보 (상품명 + 별점) */}
        <div className="review-slide-compact__default position-absolute bottom-0 start-0 end-0 p-3 text-white">
          <h6 className="mb-1 fw-semibold text-white">{itemName}</h6>
          <div className="d-flex align-items-center gap-2">
            <StarRating size={16} />
            <span className="small">{rating}/5</span>
          </div>
        </div>

        {/* 호버 오버레이 (자세한 리뷰 내용) */}
        <div className="review-slide-compact__overlay position-absolute top-0 start-0 end-0 bottom-0 d-flex flex-column justify-content-end p-3 text-white">
          <div className="review-slide-compact__content">
            <h6 className="mb-2 fw-semibold text-white">{itemName}</h6>
            <div className="d-flex align-items-center gap-2 mb-2">
              <StarRating size={16} />
              <span className="small">{rating}/5</span>
            </div>
            <p 
              className="mb-2 small text-white" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.6',
              }}
            >
              {content || '내용이 없습니다.'}
            </p>
            <div className="d-flex align-items-center gap-2 small text-white-50">
              <strong>{author}</strong>
              <span>·</span>
              <time dateTime={date}>{date}</time>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // Card variant (기본, ReviewCard용)
  return (
    <SectionCard
      className={`h-100 ${className}`}
      title={date}
      onClick={handleClick}
      bodyClassName="p-3"
    >
      <div className="row g-3">
        {firstImg && (
          <div className="col-12 col-md-4">
            <div className="position-relative">
              <img
                src={buildImageUrl(firstImg)}
                alt="리뷰 이미지"
                className="img-fluid rounded w-100"
                style={{ aspectRatio: '1/1', objectFit: 'cover', maxHeight: '200px' }}
                loading="lazy"
              />
              {imgs.length > 1 && (
                <span className="badge bg-dark position-absolute top-0 end-0 m-2">
                  +{imgs.length - 1}
                </span>
              )}
            </div>
          </div>
        )}

        <div className={`col-12 ${firstImg ? 'col-md-8' : ''} d-flex flex-column`}>
          <div className="flex-grow-1">
            <h6 className="mb-2 fw-semibold">{itemName}</h6>
            <div className="d-flex align-items-center gap-2 mb-2">
              <StarRating size={16} />
              <span className="small text-muted">{rating}/5</span>
              {price != null && (
                <>
                  <span className="small text-muted">·</span>
                </>
              )}
            </div>
            <p
              className="small mb-0"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: '1.6',
              }}
            >
              {content || '내용이 없습니다.'}
            </p>
          </div>

          {showActions && actions && (
            <div 
              className="d-flex gap-2 mt-3 pt-3 border-top"
              onClick={(e) => e.stopPropagation()}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  )
}

