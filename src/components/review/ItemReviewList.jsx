import PropTypes from 'prop-types'
import { useMemo } from 'react'
import ReviewItem from './ReviewItem'

function ItemReviewList({ item }) {
  const reviews = useMemo(() => {
    if (!item) return []
    const list = Array.isArray(item.Reviews) ? item.Reviews : []
    return list.filter(Boolean)
  }, [item])

  if (reviews.length === 0) {
    return (
      <div className="alert alert-secondary text-center py-4" role="status">
        <p className="mb-0 text-muted">작성된 리뷰가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="d-flex flex-column gap-3">
      {reviews.map((review) => (
        <ReviewItem key={review?.id} review={review} variant="list" />
      ))}
            </div>
  )
}

ItemReviewList.propTypes = {
  item: PropTypes.shape({
    Reviews: PropTypes.array,
  }).isRequired,
}

export default ItemReviewList
