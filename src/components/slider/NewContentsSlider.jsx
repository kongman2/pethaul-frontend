import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, A11y, Keyboard, Mousewheel } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import ContentCard from '../contents/ContentCard/ContentCard'
import { Button } from '../common'
import './CommonSlider.scss'

export default function NewContentsSlider({ posts = [], promotions = [], space = 12 }) {
  const hasPosts = Array.isArray(posts) && posts.length > 0
  const hasPromotions = Array.isArray(promotions) && promotions.length > 0

  if (!hasPosts && !hasPromotions) return null

  const slides = []

  if (hasPromotions) {
    promotions.forEach((promo, idx) => {
      slides.push({ type: 'promotion', data: promo, key: `promo-${promo.id ?? idx}` })
    })
  }

  if (hasPosts) {
    posts.forEach((post, idx) => {
      slides.push({ type: 'post', data: post, key: post?.id ?? post?._id ?? `post-${idx}` })
    })
  }

  return (
    <div className="commmon-horizontal new-contents-slider">
      <Swiper
        direction="horizontal"               // 가로
        slidesPerView={1}                    // 한 장
        spaceBetween={space}
        modules={[Pagination, A11y, Keyboard, Mousewheel]}
        pagination={{ clickable: true }}
        keyboard={{ enabled: true }}
        mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
        a11y={{ enabled: true }}
      >
        {slides.map((slide) => {
          if (slide.type === 'promotion') {
            const promo = slide.data
            return (
              <SwiperSlide key={slide.key} className="commmon-slide">
                <article className="promotion-slide">
                  <div className="promotion-slide__image">
                    <img src={promo.image} alt={promo.title || '프로모션 이미지'} />
                  </div>
                  <div className="promotion-slide__overlay">
                    {promo.eyebrow && <p className="promotion-slide__eyebrow">{promo.eyebrow}</p>}
                    <h3 className="promotion-slide__title">{promo.title}</h3>
                    {promo.description && <p className="promotion-slide__description">{promo.description}</p>}
                    {promo.ctaHref && (
                      <Button
                        variant="primary"
                        size="sm"
                        compact
                        onClick={(e) => {
                          e.stopPropagation()
                          window.location.href = promo.ctaHref
                        }}
                      >
                        {promo.ctaLabel || '둘러보기'}
                      </Button>
                    )}
                  </div>
                </article>
              </SwiperSlide>
            )
          }

          const post = slide.data
          return (
            <SwiperSlide key={slide.key} className="commmon-slide">
              <ContentCard item={post} post={post} />
            </SwiperSlide>
          )
        })}
      </Swiper>
    </div>
  )
}
