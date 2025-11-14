import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, A11y, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import ReviewItem from '../review/ReviewItem'
import './CommonSlider.scss'

export default function ReviewSlider({
  reviews = [],
  height = '100%',
  space = 0,
  apiBase = import.meta.env.VITE_APP_API_URL,
}) {
  if (!Array.isArray(reviews) || reviews.length === 0) return null

  return (
    <div className="commmon-horizontal review-slider h-100">
      <Swiper
        direction="horizontal"
        slidesPerView={1}
        spaceBetween={space}
        modules={[Pagination, A11y, Keyboard, Mousewheel]}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        a11y={{ enabled: true }}
        style={{ height: '100%' }}
        className="h-100"
      >
        {reviews.map((r, i) => (
          <SwiperSlide key={r?.id ?? i} className="commmon-slide h-100">
            <ReviewItem review={r} variant="compact" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
