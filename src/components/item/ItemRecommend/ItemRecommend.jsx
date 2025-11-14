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
    const price = item.price ?? item?.Price?.amount ?? item?.amount
    const priceLabel = isSoldOut ? '' : price != null ? `${Number(price).toLocaleString()}원` : undefined
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
