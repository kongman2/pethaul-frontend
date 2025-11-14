/**
 * 리뷰 관련 공통 유틸리티 함수
 */

/**
 * 리뷰에서 이미지 배열 추출
 */
export const getReviewImages = (review) => {
  return review?.ReviewImages || review?.images || review?.imageUrls || []
}

/**
 * 리뷰에서 첫 번째 이미지 URL 추출
 */
export const getReviewFirstImage = (review) => {
  const imgs = getReviewImages(review)
  if (imgs.length === 0) return null
  return typeof imgs[0] === 'string' ? imgs[0] : imgs[0]?.imgUrl || null
}

/**
 * 리뷰 평점 추출 및 정규화 (0-5)
 */
export const getReviewRating = (review) => {
  const v = Number(review?.rating ?? review?.score ?? 0)
  return Number.isFinite(v) ? Math.max(0, Math.min(5, v)) : 0
}

/**
 * 리뷰 작성자 이름 추출
 */
export const getReviewAuthor = (review) => {
  return review?.User?.name ?? review?.userName ?? '익명'
}

/**
 * 리뷰 작성일 추출 (YYYY-MM-DD 형식)
 */
export const getReviewDate = (review) => {
  return (review?.reviewDate ?? review?.createdAt ?? '').slice(0, 10)
}

/**
 * 리뷰 내용 추출
 */
export const getReviewContent = (review) => {
  return review?.reviewContent ?? review?.content ?? review?.text ?? ''
}

/**
 * 리뷰 상품명 추출
 */
export const getReviewItemName = (review) => {
  return review?.Item?.itemNm ?? '상품명'
}

/**
 * 리뷰 상품 가격 추출
 */
export const getReviewItemPrice = (review) => {
  return review?.Item?.price ?? null
}

/**
 * 날짜 포맷팅 (한국어 형식)
 */
export const formatReviewDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('ko-KR')
}

