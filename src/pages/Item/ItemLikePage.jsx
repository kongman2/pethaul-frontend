import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, FilterForm, ItemCard } from '../../components/common'
import ItemListLayout from '../../components/item/ItemListLayout'
import ItemListEmpty from '../../components/item/ItemListEmpty'
import ItemListLoading from '../../components/item/ItemListLoading'
import useItemFilters from '../../hooks/useItemFilters'
import { fetchMyLikedItemsThunk, fetchMyLikeIdsThunk, toggleLikeThunk } from '../../features/likeSlice'
import useAppBackground from '../../hooks/useAppBackground'
import { getImageUrl } from '../../utils/imageUtils'

export default function ItemLikePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((s) => s.auth?.user)
  const isLoggedIn = !!user

  useAppBackground('app-bg--dots')

  useEffect(() => {
    if (!isLoggedIn) return
    dispatch(fetchMyLikedItemsThunk())
    dispatch(fetchMyLikeIdsThunk())
  }, [dispatch, isLoggedIn])

  const {
    items: likedItems = [],
    idsMap: likes = {},
    loadItemsLoading: loading,
    error,
    errorCode,
  } = useSelector((s) => s.like || {})

  const [filterOpen, setFilterOpen] = useState(false)


  const extractCategories = (item) => {
    if (!item) return []
    if (Array.isArray(item.Categories)) {
      return item.Categories.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
    }
    if (Array.isArray(item.ItemCategories)) {
      return item.ItemCategories.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
    }
    if (Array.isArray(item.Category)) {
      return item.Category.map((c) => c?.categoryName ?? c?.name).filter(Boolean)
    }
    if (item.Category?.categoryName) {
      return [item.Category.categoryName]
    }
    if (Array.isArray(item.tags)) {
      return item.tags.filter(Boolean)
    }
    if (Array.isArray(item.hashtags)) {
      return item.hashtags.filter(Boolean)
    }
    return []
  }

  const formatPrice = (v) => {
    if (v == null) return null
    const n = Number(String(v).replace(/,/g, ''))
    if (Number.isNaN(n)) return null
    return new Intl.NumberFormat('ko-KR').format(n)
  }

  const list = useMemo(
    () => (Array.isArray(likedItems) ? likedItems.filter(Boolean) : []),
    [likedItems]
  )

  const likedList = useMemo(
    () => list.filter((it) => !!likes[it.id]),
    [list, likes]
  )

  const {
    selectedCats,
    setSelectedCats,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    sellStatus,
    setSellStatus,
    inStockOnly,
    setInStockOnly,
    filteredList,
    allCategories: categoryOptions,
    activeFilterChips,
    handleResetFilters,
  } = useItemFilters(likedList, {
    enableStockToggle: true,
    inStockStatus: 'SELL',
    statusLabels: {
      SELL: '판매중',
      SOLD_OUT: '품절',
    },
  })

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'SELL', label: '판매중' },
    { value: 'SOLD_OUT', label: '품절' },
  ]

  const handleLike = (id) => {
    if (!id) return
    dispatch(toggleLikeThunk(id))
  }

  if (!isLoggedIn) {
    return (
        <section className="container py-5 text-center d-flex flex-column gap-3 align-items-center">
        <p className="mb-3">좋아요한 상품을 보려면 로그인해주세요.</p>
          <Button variant="primary" onClick={() => navigate('/auth/login')}>
            로그인하러 가기
          </Button>
        </section>
    )
  }

  if (loading) {
    return (
      <section className="container py-5 text-center d-flex flex-column gap-3 align-items-center">
          <ItemListLoading message="좋아요한 상품을 불러오는 중입니다..." />
      </section>
    )
  }

  if (error) {
    const isAuthError = errorCode === 401 || errorCode === 403
    return (
      <section className="container py-5 text-center d-flex flex-column gap-3 align-items-center">
          <p className="error mb-0">
            {isAuthError ? '세션이 만료되었거나 권한이 없습니다. 다시 로그인해주세요.' : `에러 발생: ${String(error)}`}
          </p>
          {isAuthError ? (
            <Button variant="primary" onClick={() => navigate('/auth/login')}>
              로그인 다시 하기
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => {
              dispatch(fetchMyLikedItemsThunk())
              dispatch(fetchMyLikeIdsThunk())
            }}>
              다시 시도
            </Button>
          )}
      </section>
    )
  }

  const filterFormNode = (
    <FilterForm
      categoryOptions={categoryOptions}
      statusOptions={statusOptions}
      values={{
        selectedCats,
        status: sellStatus,
        priceMin,
        priceMax,
        inStockOnly,
      }}
      onChange={{
        setSelectedCats,
        setStatus: setSellStatus,
        setPriceMin,
        setPriceMax,
        setInStockOnly,
      }}
      onReset={handleResetFilters}
      showCategory
      showPrice
      showStatus
      showStockToggle
      collapsible={false}
      variant="item"
    />
  )

  const chipsNode =
    activeFilterChips.length > 0 ? (
      <div className="row justify-content-center mt-3">
        <div className="col-12 col-xl-10">
          <div className="filter-form__active-chips">
            {activeFilterChips.map((chip) => (
              <button key={chip.key} type="button" className="filter-form__chip-removable" onClick={chip.onRemove}>
                <span>{chip.label}</span>
                <span className="filter-form__chip-x" aria-label="remove">
                  ×
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    ) : null

  const cardsNode = (
    <div className="row g-3 g-md-4">
      {filteredList.map((item) => {
        if (!item) return null

        const repImage = item.ItemImages?.find((img) => img.repImgYn === 'Y')?.imgUrl || item.ItemImages?.[0]?.imgUrl
        const imgSrc = getImageUrl(repImage)
        const liked = !!likes[item.id]
        const isSoldOut = (item.itemSellStatus ?? item.sellStatus) === 'SOLD_OUT'

        const categories = extractCategories(item)

        const rawPrice = item.price ?? item?.Price?.amount ?? item?.amount
        const discountPercent = item?.discountPercent ?? 0
        const priceNum = rawPrice ? Number(rawPrice) : 0
        const discountNum = discountPercent ? Number(discountPercent) : 0
        
        // 할인 가격 계산
        const discountedPrice = discountNum > 0 && priceNum > 0 
           ? Math.floor(priceNum * (1 - discountNum / 100))
           : null
        
        const displayPrice = discountedPrice ?? priceNum
        const prettyPrice = formatPrice(displayPrice)
        const originalPrice = discountNum > 0 && priceNum > 0 ? formatPrice(priceNum) : null
        
        // 가격 레이블 생성 (할인 가격이 있으면 원가 취소선 표시)
        let priceLabel = ''
        if (!isSoldOut) {
           if (prettyPrice) {
              if (discountedPrice && originalPrice) {
                 priceLabel = (
                    <div className="item-card__price-wrapper">
                       <span className="item-card__price-original" style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9em', marginRight: '0.5rem' }}>
                          {originalPrice}원
                       </span>
                       <span className="item-card__price-discounted" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                          {prettyPrice}원
                       </span>
                       <span className="item-card__discount-badge" style={{ marginLeft: '0.5rem', color: '#e74c3c', fontSize: '0.85em' }}>
                          {discountNum}%
                       </span>
                    </div>
                 )
              } else {
                 priceLabel = `${prettyPrice}원`
              }
           } else {
              priceLabel = '가격 정보 없음'
           }
        }

        const overlayStart = isSoldOut ? <span className="badge text-bg-danger rounded-pill shadow-sm">SOLD OUT</span> : null

        return (
          <div className="col-6 col-md-4 col-lg-3 d-flex" key={item.id}>
            <ItemCard
              imageUrl={imgSrc}
              title={item.itemNm ?? '상품'}
              tags={categories}
              href={`/items/detail/${item.id}`}
              priceLabel={priceLabel}
              overlayStart={overlayStart}
              liked={liked}
              onToggleLike={() => handleLike(item.id)}
              className="w-100"
            />
          </div>
        )
      })}
    </div>
  )

  const chipsWrapper = chipsNode

  const emptyNode = (
    <ItemListEmpty
      message={
        likedList.length === 0
          ? '좋아요한 상품이 없습니다.'
          : '필터에 해당하는 상품이 없습니다.'
      }
    />
  )

  return (
    <section className="container py-5">
      <ItemListLayout
        title="좋아요한 상품"
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((prev) => !prev)}
        filterForm={filterFormNode}
        activeFilterChips={chipsWrapper}
        countLabel={`상품 ${filteredList.length}개`}
        sortControl={null}
        hasItems={filteredList.length > 0}
        emptyContent={emptyNode}
        pagination={null}
      >
        {cardsNode}
      </ItemListLayout>
    </section>
  )
}
