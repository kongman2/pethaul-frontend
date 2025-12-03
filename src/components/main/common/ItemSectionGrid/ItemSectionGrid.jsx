import { Icon } from '@iconify/react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useMemo } from 'react'

import { ItemCard, AlertModal } from '../../../common'
import { useModalHelpers } from '../../../../hooks/useModalHelpers'
import { fetchMyLikeIdsThunk, toggleLikeThunk } from '../../../../features/likeSlice'

import './ItemSectionGrid.scss'

const defaultGetItemId = (item) => item?.itemId ?? item?.id ?? item?.ItemId ?? item?.Item?.id
const defaultGetImage = (item) => item?.ItemImages?.[0]?.imgUrl ?? item?.imageUrl ?? item?.thumbnail
const defaultGetTitle = (item) => item?.itemNm ?? item?.title ?? item?.name ?? ''
const defaultGetPriceLabel = (item) => {
   const rawPrice = item?.price ?? item?.Price?.amount ?? item?.amount
   const discountPercent = item?.discountPercent ?? 0
   const priceNum = rawPrice ? Number(rawPrice) : 0
   const discountNum = discountPercent ? Number(discountPercent) : 0
   
   if (priceNum === 0) return undefined
   
   // 할인 가격 계산
   const discountedPrice = discountNum > 0 && priceNum > 0 
      ? Math.floor(priceNum * (1 - discountNum / 100))
      : null
   
   const displayPrice = discountedPrice ?? priceNum
   const originalPrice = discountNum > 0 && priceNum > 0 ? priceNum : null
   
   // 할인 가격이 있으면 원가 취소선 표시
   if (discountedPrice && originalPrice) {
      return (
         <div className="item-card__price-wrapper">
            <span className="item-card__price-original" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em', marginRight: '0.5rem' }}>
               {originalPrice.toLocaleString()}원
            </span>
            <span className="item-card__price-discounted" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
               {discountedPrice.toLocaleString()}원
            </span>
            <span className="item-card__discount-badge" style={{ marginLeft: '0.5rem', color: '#e74c3c', fontSize: '0.85em' }}>
               {discountNum}%
            </span>
         </div>
      )
   }
   
   return `${displayPrice.toLocaleString()}원`
}
const defaultGetTags = (item) => {
   if (Array.isArray(item?.Categories)) {
      return item.Categories.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
   }
   if (Array.isArray(item?.Category)) {
      return item.Category.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
   }
   if (item?.Category?.categoryName) {
      return [item.Category.categoryName]
   }
   if (Array.isArray(item?.tags)) {
      return item.tags.filter(Boolean)
   }
   if (Array.isArray(item?.hashtags)) {
      return item.hashtags.filter(Boolean)
   }
   if (Array.isArray(item?.ItemCategories)) {
      return item.ItemCategories.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
   }
   return []
}

let lastLikesUserId = null

function ItemSectionGrid({
   id,
   title,
   icon,
   iconSize = 32,
   moreHref,
   moreLabel = 'More',
   items = [],
   maxItems,
   buildImg = (url) => url,
   getItemId = defaultGetItemId,
   getImage = defaultGetImage,
   getTitle = defaultGetTitle,
   getPriceLabel = defaultGetPriceLabel,
   getTags = defaultGetTags,
   getHref,
   renderItem,
   containerClassName = 'container py-5',
   rowClassName = 'row g-4',
   colClassName = 'col-6 col-md-3 d-flex',
   cardWrapperClassName = 'flex-grow-1 h-100',
   emptyMessage,
   children,
   likeEnabled = true,
}) {
   const sectionClassName = [containerClassName, 'item-section-grid'].filter(Boolean).join(' ')
   const displayedItems = maxItems ? items.slice(0, maxItems) : items
   const hasItems = displayedItems.length > 0

   const dispatch = useDispatch()
   const likesMap = useSelector((state) => state.like.idsMap) || {}
   const user = useSelector((state) => state.auth.user)
   const { alert, alertModal } = useModalHelpers()

   const canToggleLike = useMemo(() => {
      if (!user) return false
      const idCandidate = user.id ?? user.userId ?? user._id
      return !!idCandidate
   }, [user])

   useEffect(() => {
      if (!likeEnabled) return
      if (!canToggleLike) return
      const currentUserId = user?.id ?? user?.userId ?? user?._id
      if (!currentUserId) return
      if (lastLikesUserId === currentUserId) return
      lastLikesUserId = currentUserId
      dispatch(fetchMyLikeIdsThunk())
   }, [dispatch, likeEnabled, canToggleLike, user])

   const handleToggleLike = (itemId) => {
      if (!likeEnabled || !itemId) return
      if (!canToggleLike) {
         alert('로그인 후 좋아요를 사용할 수 있습니다.', '로그인 필요', 'warning')
         return
      }
      dispatch(toggleLikeThunk(itemId))
   }

   return (
      <section id={id} className={sectionClassName}>
         <div className="section-title d-flex align-items-center justify-content-between mb-4">
            <p className="mb-0 d-flex align-items-center gap-2">
               <span>{title}</span>
               {icon ? <Icon icon={icon} width={iconSize} height={iconSize} /> : null}
            </p>
            {moreHref ? (
               <Link className="more-btn" to={moreHref}>
                  {moreLabel} <Icon icon="pixel:angle-right" width={14} height={14} />
               </Link>
            ) : null}
         </div>

         {hasItems ? (
            <div className={rowClassName}>
               {displayedItems.map((item) => {
                  const itemId = getItemId(item)
                  const rawImage = getImage(item)
                  const imageUrl = rawImage ? buildImg(rawImage) : undefined
                  const cardTitle = getTitle(item)
                  const priceLabel = getPriceLabel ? getPriceLabel(item) : undefined
                  const href = getHref ? getHref(item, itemId) : undefined
                  const tags = getTags ? getTags(item) ?? [] : []
                  const liked = likeEnabled && itemId != null ? !!likesMap[itemId] : false
                  const toggleLike = () => handleToggleLike(itemId)
                  const showLike = likeEnabled && canToggleLike

                  return (
                     <div key={itemId ?? cardTitle} className={colClassName}>
                        {renderItem ? (
                           renderItem({
                              item,
                              itemId,
                              imageUrl,
                              title: cardTitle,
                              priceLabel,
                              tags,
                              href,
                              liked,
                              onToggleLike: toggleLike,
                              likeDisabled: !canToggleLike,
                              showLike,
                           })
                        ) : (
                           <ItemCard
                              className={cardWrapperClassName}
                              imageUrl={imageUrl}
                              title={cardTitle}
                              priceLabel={priceLabel}
                              tags={tags}
                              href={href}
                              liked={liked}
                              onToggleLike={likeEnabled ? toggleLike : undefined}
                              likeDisabled={!canToggleLike}
                              showLike={showLike}
                           />
                        )}
                     </div>
                  )
               })}
            </div>
         ) : emptyMessage ? (
            <div className="item-section-grid__empty">{emptyMessage}</div>
         ) : null}

         {children}
         <AlertModal
            open={alertModal.isOpen}
            onClose={alertModal.close}
            title={alertModal.config.title}
            message={alertModal.config.message}
            buttonText={alertModal.config.buttonText}
            variant={alertModal.config.variant}
         />
      </section>
   )
}

ItemSectionGrid.propTypes = {
   id: PropTypes.string,
   title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
   icon: PropTypes.string,
   iconSize: PropTypes.number,
   moreHref: PropTypes.string,
   moreLabel: PropTypes.string,
   items: PropTypes.arrayOf(PropTypes.object),
   maxItems: PropTypes.number,
   buildImg: PropTypes.func,
   getItemId: PropTypes.func,
   getImage: PropTypes.func,
   getTitle: PropTypes.func,
   getPriceLabel: PropTypes.func,
   getTags: PropTypes.func,
   getHref: PropTypes.func,
   renderItem: PropTypes.func,
   containerClassName: PropTypes.string,
   rowClassName: PropTypes.string,
   colClassName: PropTypes.string,
   cardWrapperClassName: PropTypes.string,
   emptyMessage: PropTypes.node,
   children: PropTypes.node,
   likeEnabled: PropTypes.bool,
}

export default ItemSectionGrid

