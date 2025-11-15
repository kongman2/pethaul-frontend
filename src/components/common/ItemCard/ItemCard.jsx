import { memo } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Icon } from '@iconify/react'
import { getNoImage } from '../../../utils/imageUtils'

import './ItemCard.scss'

function ItemCard({
  imageUrl,
  title,
  subtitle,
  priceLabel,
  tags = [],
  href,
  overlayStart,
  overlayEnd,
  footer,
  className,
  children,
  liked = false,
  onToggleLike,
  likeDisabled = false,
  likeLabel,
  showLike = true,
}) {
  const baseClass = ['item-card']
  if (className) baseClass.push(className)
  const cardClassName = baseClass.join(' ')

  const resolvedImageUrl = imageUrl || getNoImage()

  const handleLikeClick = (event) => {
    event.preventDefault()
    event.stopPropagation()
    if (likeDisabled) return
    onToggleLike?.(event)
  }

  const likeButton = showLike && typeof onToggleLike === 'function' && (
    <button
      type="button"
      className={`item-card__like-btn ${liked ? 'is-liked' : ''}`}
      onClick={handleLikeClick}
      disabled={likeDisabled}
      aria-pressed={liked}
      aria-label={likeLabel || (liked ? '좋아요 취소' : '좋아요')}
      title={likeLabel || (liked ? '좋아요 취소' : '좋아요')}
    >
      {liked ? (
        <Icon icon="pixel:heart-solid" width="24" height="24" className="item-card__like-icon" aria-hidden="true" />
      ) : (
        <Icon icon="pixel:heart" width="24" height="24" className="item-card__like-icon" aria-hidden="true" />
      )}
    </button>
  )

  const overlayEndNode = overlayEnd || null

  const cardInner = (
    <article className={cardClassName}>
      <div className="item-card__cover">
        <img className="item-card__cover-image" src={resolvedImageUrl} alt={title} loading="lazy" />
        {(overlayStart || overlayEndNode) && (
          <div className="item-card__overlay">
            <div>{overlayStart}</div>
            <div>{overlayEndNode}</div>
          </div>
        )}
      </div>

      <div className="item-card__content">
        {(tags.length > 0 || likeButton) && (
          <div className="item-card__meta">
            {tags.length > 0 && (
              <div className="item-card__tags">
                {/* 대표 태그 1개만 표시 */}
                <span className="item-card__tag">
                  #{tags[0]}
                </span>
              </div>
            )}
            {likeButton}
          </div>
        )}

        <div className="item-card__heading">
          <h3 className="item-card__title">{title}</h3>
          {subtitle && <p className="item-card__subtitle">{subtitle}</p>}
        </div>

        {priceLabel && (
          <div className="item-card__price">
            {typeof priceLabel === 'string' ? priceLabel : priceLabel}
          </div>
        )}

        {children}

        {footer && <div className="item-card__footer">{footer}</div>}
      </div>
    </article>
  )

  if (href) {
    return (
      <Link to={href} className="item-card__link">
        {cardInner}
      </Link>
    )
  }

  return cardInner
}

ItemCard.propTypes = {
  imageUrl: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  priceLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  tags: PropTypes.arrayOf(PropTypes.string),
  href: PropTypes.string,
  overlayStart: PropTypes.node,
  overlayEnd: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
  liked: PropTypes.bool,
  onToggleLike: PropTypes.func,
  likeDisabled: PropTypes.bool,
  likeLabel: PropTypes.string,
  showLike: PropTypes.bool,
}

export default memo(ItemCard)

