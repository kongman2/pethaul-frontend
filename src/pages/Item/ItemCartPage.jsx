import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { fetchCartItemsThunk, updateCartItemThunk, deleteCartItemThunk } from '../../features/cartSlice'
import { recommendLikesThunk } from '../../features/itemSlice'

import ItemRecommend from '../../components/item/ItemRecommend'
import { SectionCard, Button, QuantityControl, PageHeader } from '../../components/common'
import { getImageUrl, getNoImage } from '../../utils/imageUtils'

import useAppBackground from '../../hooks/useAppBackground'

import './itemCartPage.scss'

const toInt = (value, fallback = 0) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function SkeletonCard() {
  return (
    <div className="skeleton-card card border-0 shadow-sm p-3">
      <div className="skeleton img" />
      <div className="skeleton text w60" />
      <div className="skeleton text w40" />
    </div>
  )
}

function ItemCartPage() {
  useAppBackground('app-bg--blue')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { items: cartItems = [], loading } = useSelector((state) => state.cart)
  const { recommends } = useSelector((state) => state.item)
  const user = useSelector((state) => state.auth.user)

  const userId = user?.id
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (userId) {
      dispatch(fetchCartItemsThunk(userId))
      dispatch(recommendLikesThunk(userId))
    }
  }, [dispatch, userId])


  const handleUpdate = (itemId, count) => {
    const next = Number(count)
    if (!Number.isFinite(next) || next < 1) return
    dispatch(updateCartItemThunk({ itemId, count: next }))
  }

  const handleDelete = (itemId) => {
    dispatch(deleteCartItemThunk(itemId))
  }

  const handleOrder = () => {
    if (cartItems.length === 0) return
    setSubmitting(true)
    navigate('/order', { state: { cartItems } })
    setSubmitting(false)
  }

  const totalPrice = useMemo(
    () => cartItems.reduce((acc, ci) => acc + toInt(ci.Item?.price, 0) * Math.max(1, toInt(ci.count, 1)), 0),
    [cartItems]
  )

  if (!userId) {
    return (
      <section className="container py-5 text-center d-flex flex-column gap-3 align-items-center">
        <p className="mb-3">장바구니를 확인하려면 로그인해주세요.</p>
        <Button variant="primary" onClick={() => navigate('/login')}>
          로그인하러 가기
        </Button>
      </section>
    )
  }

  return (
    <div className="container py-5">
      <PageHeader
        title="장바구니"
        description="담아두신 상품을 확인하고 주문을 진행해 주세요."
        onBack={() => navigate(-1)}
        className="mb-4 text-lg-start"
        headingLevel="h2"
      />
      <div className="row g-4">
        <section className="col-12 col-lg-8">
          <div className="d-flex flex-column gap-3">
            {loading ? (
              <div className="d-grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonCard key={`sk-${index}`} />
                ))}
              </div>
            ) : null}

            {!loading && cartItems.length === 0 ? (
              <div className="empty text-center py-5">
                <p className="mb-0 text-muted">장바구니가 비었습니다.</p>
              </div>
            ) : null}

            {!loading &&
              cartItems.map((cartItem, index) => {
                const product = cartItem.Item
                const itemId = cartItem.itemId ?? product?.id
                const name = product?.itemNm || '상품명'
                const repImage =
                  product?.ItemImages?.find((img) => img.repImgYn === 'Y')?.imgUrl || getNoImage()
                const imgSrc = getImageUrl(repImage)
                const price = toInt(product?.price, 0)
                const qty = Math.max(1, toInt(cartItem.count, 1))
                const stock = Number(product?.stockNumber ?? product?.stock ?? 0)
                const maxQty = Number.isFinite(stock) && stock > 0 ? stock : 99

                return (
                  <article
                    className="cart-card card shadow-sm border-0 position-relative p-3 d-flex flex-column flex-md-row align-items-stretch gap-3"
                    key={`${cartItem.id ?? itemId}-${index}`}
                  >
                    <button
                      type="button"
                      className="cart-card__delete btn btn-sm btn-outline-secondary rounded-circle"
                      onClick={() => handleDelete(itemId)}
                      aria-label="삭제"
                    >
                      ×
                    </button>
                    <div className="cart-card__thumb rounded overflow-hidden flex-shrink-0">
                      <img src={imgSrc} alt={name} />
                    </div>
                    <div className="cart-card__body flex-grow-1 d-flex flex-column gap-3 gap-md-4">
                      <div className="flex-grow-1">
                        <p className="cart-card__name fw-semibold mb-1" title={name}>
                          {name}
                        </p>
                        <p className="text-muted mb-0 small">상품번호: {itemId}</p>
                      </div>
                      <div className="d-flex flex-column align-items-end justify-content-between gap-2">
                        <QuantityControl
                          value={qty}
                          min={1}
                          max={maxQty}
                          onChange={(next) => handleUpdate(itemId, next)}
                          variant="compact"
                        />
                        <p className="cart-card__price mb-0">{price.toLocaleString()}원</p>
                      </div>
                    </div>
                  </article>
                )
              })}
          </div>

          <section className="mt-5">
            <h3 className="section-title h5 mb-3">{user?.name} 님을 위한 추천 상품</h3>
            <ItemRecommend recommends={recommends} />
          </section>
        </section>

        <aside className="col-12 col-lg-4">
            <SectionCard title="결제하기" headerActions={null}>
              <div className="d-grid gap-3">
                <div>
                  <p className="sub-title text-muted mb-2">예상 결제금액</p>
                  <p className="h5 mb-0">{totalPrice.toLocaleString()}원</p>
                </div>
                <div className="d-flex align-items-center justify-content-between text-muted">
                  <span>상품 금액</span>
                  <strong className="text-dark">{totalPrice.toLocaleString()}원</strong>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleOrder}
                  disabled={submitting || cartItems.length === 0}
                >
                  {submitting ? '처리 중…' : '주문하기'}
                </Button>
              </div>
            </SectionCard>
        </aside>
      </div>
    </div>
  )
}

export default ItemCartPage
