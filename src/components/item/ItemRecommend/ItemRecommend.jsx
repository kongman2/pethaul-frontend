import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'

import { fetchMyLikeIdsThunk, toggleLikeThunk } from '../../../features/likeSlice'
import { ItemCard, AlertModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { getImageUrl } from '../../../utils/imageUtils'

let lastRecommendLikesUserId = null

function ItemRecommend({ recommends = [] }) {
  const dispatch = useDispatch()
  const { alert, alertModal } = useModalHelpers()

  const likes = useSelector((state) => state.like.idsMap) || {}
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    const userId = user?.id ?? user?.userId ?? user?._id
    if (!userId) return
    if (lastRecommendLikesUserId === userId) return
    lastRecommendLikesUserId = userId
    dispatch(fetchMyLikeIdsThunk())
  }, [dispatch, user])

  const handleLike = (id) => {
    if (!id) return
    const userId = user?.id ?? user?.userId ?? user?._id
    if (!userId) {
      alert('로그인 후 좋아요를 사용할 수 있습니다.', '로그인 필요', 'warning')
      return
    }
    dispatch(toggleLikeThunk(id))
  }

  return (
    <>
      {recommends.map((item) => {
    if (!item) return null
    const repImage = item.ItemImages?.[0]?.imgUrl || item.imageUrl
    const imgSrc = getImageUrl(repImage)
    const liked = !!likes[item.id]
    const isSoldOut = (item.itemSellStatus ?? item.sellStatus) === 'SOLD_OUT'
    const categories = (item.Categories ?? [])
      .map((c) => c?.categoryName ?? c?.name)
      .filter(Boolean)
    const rawPrice = item.price ?? item?.Price?.amount ?? item?.amount
    const discountPercent = item?.discountPercent ?? 0
    const priceNum = rawPrice ? Number(rawPrice) : 0
    const discountNum = discountPercent ? Number(discountPercent) : 0
    
    // 할인 가격 계산
    const discountedPrice = discountNum > 0 && priceNum > 0 
       ? Math.floor(priceNum * (1 - discountNum / 100))
       : null
    
    const displayPrice = discountedPrice ?? priceNum
    const originalPrice = discountNum > 0 && priceNum > 0 ? priceNum : null
    
    // 가격 레이블 생성 (할인 가격이 있으면 원가 취소선 표시)
    let priceLabel = undefined
    if (!isSoldOut && displayPrice > 0) {
       if (discountedPrice && originalPrice) {
          priceLabel = (
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
       } else {
          priceLabel = `${displayPrice.toLocaleString()}원`
       }
    }
    const overlayStart = isSoldOut ? <span className="badge text-bg-danger rounded-pill shadow-sm">품절</span> : null

    return (
      <ItemCard
        key={item.id ?? item.itemNm}
        imageUrl={imgSrc}
        title={item.itemNm ?? item.title ?? '상품'}
        tags={categories}
        priceLabel={priceLabel}
        href={item.id ? `/items/detail/${item.id}` : undefined}
        overlayStart={overlayStart}
        liked={liked}
        onToggleLike={() => handleLike(item.id)}
        likeDisabled={!user}
      />
    )
  })}
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </>
  )
}

export default ItemRecommend
