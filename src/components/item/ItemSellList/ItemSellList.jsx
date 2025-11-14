import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { fetchItemsThunk } from '../../../features/itemSlice'
import { toggleLikeThunk, fetchMyLikeIdsThunk } from '../../../features/likeSlice'
import { Pagination } from 'react-bootstrap'
import { ItemCard, SortDropdown } from '../../common'
import ItemListLayout from '../ItemListLayout'
import ItemListLoading from '../ItemListLoading'
import { getImageUrl } from '../../../utils/imageUtils'
import ItemListEmpty from '../ItemListEmpty'
import './ItemSellList.scss'
import FilterForm from '../../common/FilterForm/FilterForm'
import useItemFilters from '../../../hooks/useItemFilters'


export default function ItemSellList({
   searchTerm,
   sellCategory: sellCategoryProp,
   title,
   items: itemsProp,
   loading: loadingProp,
   error: errorProp,
   pagination: paginationProp,
   autoFetch = true,
}) {
   const location = useLocation()
   const derivedSellCategory = sellCategoryProp ?? (location?.state ?? '')
   const dispatch = useDispatch()
   const { items = [], loading, error, pagination } = useSelector((s) => s.item)
   const likes = useSelector((s) => s.like.idsMap) || {}
   const user = useSelector((state) => state.auth.user)
   const [page, setPage] = useState(1)
   const [filterOpen, setFilterOpen] = useState(false)

   // ====== 초기 로드 ======
   const shouldFetch = autoFetch && !itemsProp

   useEffect(() => {
      if (shouldFetch) {
         const payload = { page, limit: 10 }
         if (searchTerm && searchTerm.length > 0) {
            payload.searchTerm = searchTerm
         }

         if (derivedSellCategory) {
            if (typeof derivedSellCategory === 'object' && !Array.isArray(derivedSellCategory)) {
               Object.assign(payload, derivedSellCategory)
            } else {
               payload.sellCategory = derivedSellCategory
            }
         }

         dispatch(fetchItemsThunk(payload))
      }

      if (user) {
         dispatch(fetchMyLikeIdsThunk())
      }
   }, [dispatch, user, derivedSellCategory, searchTerm, page, shouldFetch])

   // 페이지 변경
   const handlePageChange = (e, value) => {
      setPage(value)
   }


   // ====== 유틸 ======

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

   // ====== 목록/카테고리 파생 ======
   const sourceItems = itemsProp ?? items
   const paginationData = paginationProp ?? pagination
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
   } = useItemFilters(sourceItems, {
      enableStockToggle: true,
      inStockStatus: 'SELL',
      statusLabels: {
         SELL: '판매중',
         SOLD_OUT: '품절',
      },
   })
   const statusOptions = useMemo(
      () => [
         { value: 'all', label: '전체' },
         { value: 'SELL', label: '판매중' },
         { value: 'SOLD_OUT', label: '품절' },
      ],
      []
   )
   const normalizedSearchTerm = useMemo(() => {
      if (!searchTerm) return ''
      if (Array.isArray(searchTerm)) return searchTerm.filter(Boolean).join(' / ')
      return searchTerm
   }, [searchTerm])
   const normalizedSellCategory = useMemo(() => {
      if (!derivedSellCategory) return ''
      if (Array.isArray(derivedSellCategory)) return derivedSellCategory.filter(Boolean).join(' / ')
      if (typeof derivedSellCategory === 'object') return ''
      return derivedSellCategory
   }, [derivedSellCategory])
   const headerTitle = useMemo(() => {
      if (selectedCats.length > 0) {
         return selectedCats.map((n) => `#${n}`).join(' ')
      }
      if (title) return title
      if (normalizedSellCategory) return normalizedSellCategory
      if (normalizedSearchTerm) return normalizedSearchTerm
      return '상품 목록'
   }, [selectedCats, title, normalizedSellCategory, normalizedSearchTerm])
   const sortOptions = useMemo(
      () => [
         { value: 'recommended', label: '추천순' },
         { value: 'latest', label: '최신순' },
         { value: 'priceAsc', label: '낮은 가격순' },
         { value: 'priceDesc', label: '높은 가격순' },
      ],
      []
   )
   const [sortOption, setSortOption] = useState('recommended')
   const sortedList = useMemo(() => {
      const arr = Array.isArray(filteredList) ? [...filteredList] : []
      const getPriceValue = (item) => {
         const raw = item?.price ?? item?.Price?.amount ?? item?.amount
         if (raw == null) return null
         const num = Number(String(raw).replace(/,/g, ''))
         return Number.isNaN(num) ? null : num
      }

      switch (sortOption) {
         case 'priceAsc':
            arr.sort((a, b) => {
               const pa = getPriceValue(a)
               const pb = getPriceValue(b)
               if (pa == null && pb == null) return 0
               if (pa == null) return 1
               if (pb == null) return -1
               return pa - pb
            })
            break
         case 'priceDesc':
            arr.sort((a, b) => {
               const pa = getPriceValue(a)
               const pb = getPriceValue(b)
               if (pa == null && pb == null) return 0
               if (pa == null) return 1
               if (pb == null) return -1
               return pb - pa
            })
            break
         case 'latest':
            arr.sort((a, b) => {
               const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0
               const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0
               if (!Number.isFinite(da) && !Number.isFinite(db)) return 0
               if (!Number.isFinite(da)) return 1
               if (!Number.isFinite(db)) return -1
               return db - da
            })
            break
         case 'recommended':
         default:
            break
      }
      return arr
   }, [filteredList, sortOption])

   const handleLike = (id) => {
      if (!id) return
      dispatch(toggleLikeThunk(id))
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
         {sortedList.map((item) => {
            if (!item) return null

            const repImage = item.ItemImages?.find((img) => img.repImgYn === 'Y')?.imgUrl || item.ItemImages?.[0]?.imgUrl
            const imgSrc = getImageUrl(repImage)
            const liked = !!likes[item?.id]
            const isSoldOut = (item?.itemSellStatus ?? item?.sellStatus) === 'SOLD_OUT'

            const categories = extractCategories(item)

            const rawPrice = item?.price ?? item?.Price?.amount ?? item?.amount
            const prettyPrice = formatPrice?.(rawPrice)
            const priceLabel = isSoldOut ? '' : prettyPrice ? `₩${prettyPrice}` : '가격 정보 없음'

            const overlayStart = isSoldOut ? <span className="badge text-bg-danger rounded-pill shadow-sm">품절</span> : null

            return (
               <div className="col-6 col-md-4 col-lg-3 d-flex" key={item?.id ?? repImage ?? item?.itemNm}>
                  <ItemCard
                     imageUrl={imgSrc}
                     title={item?.itemNm ?? '상품'}
                     tags={categories}
                     href={`/items/detail/${item?.id}`}
                     priceLabel={priceLabel}
                     overlayStart={overlayStart}
                     liked={liked}
                     onToggleLike={() => handleLike(item?.id)}
                     className="w-100"
                  />
               </div>
            )
         })}
      </div>
   )

   const paginationNode =
      paginationData && (
         <div className="pethaul-pagination mt-4">
            <Pagination>
               {Array.from({ length: paginationData?.totalPages ?? 0 }, (_, i) => i + 1).map((pageNum) => (
                  <Pagination.Item
                     key={pageNum}
                     active={pageNum === page}
                     onClick={() => handlePageChange?.(null, pageNum)}
                  >
                     {pageNum}
                  </Pagination.Item>
               ))}
            </Pagination>
         </div>
      )

   const emptyNode = <ItemListEmpty message="검색된 상품이 없습니다." />

   return (
      <ItemListLayout
         title={headerTitle}
         filterOpen={filterOpen}
         onToggleFilter={() => setFilterOpen((prev) => !prev)}
         filterForm={filterFormNode}
         activeFilterChips={chipsNode}
         countLabel={`상품 ${sortedList.length}개`}
         sortControl={<SortDropdown options={sortOptions} value={sortOption} onChange={setSortOption} />}
         hasItems={Array.isArray(sortedList) && sortedList.length > 0}
         emptyContent={emptyNode}
         pagination={paginationNode}
      >
         {cardsNode}
      </ItemListLayout>
   )
}
