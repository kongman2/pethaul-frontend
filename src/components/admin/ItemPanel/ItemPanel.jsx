import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'

import { deleteItemThunk, fetchItemsThunk } from '../../../features/itemSlice'
import { useNavigate } from 'react-router-dom'
import FilterForm from '../../common/FilterForm/FilterForm'
import { Button, ItemCard, SectionCard, Spinner, AlertModal, ConfirmModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { getPlaceholderImage } from '../../../utils/imageUtils'
import './ItemPanel.scss'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'
import { filterItems } from '../../../utils/itemFilters'

function ItemPanel({ searchTerm, sellCategory }) {
   const dispatch = useDispatch()
   const { items, loading, error } = useSelector((state) => state.item)
   const navigate = useNavigate()
   const { alertModal, confirmModal } = useModalHelpers()

   // ----- Hooks (항상 최상단) -----
   const [selectedCats, setSelectedCats] = useState([])
   const [priceMin, setPriceMin] = useState('')
   const [priceMax, setPriceMax] = useState('')
   const [sellStatus, setSellStatus] = useState('all')
   const [inStockOnly, setInStockOnly] = useState(false) // 스위치
   const [filterOpen, setFilterOpen] = useState(false)

   useEffect(() => {
      dispatch(fetchItemsThunk({ searchTerm, sellCategory }))
   }, [dispatch, searchTerm, sellCategory])

   const baseURL = import.meta.env.VITE_APP_API_URL || ''

   const list = useMemo(() => (Array.isArray(items) ? items.filter(Boolean) : []), [items])

   const allCategories = useMemo(() => {
      const map = new Map()
      for (const it of list) {
         for (const c of it?.Categories ?? []) {
            const name = c?.categoryName ?? c?.name ?? ''
            if (name && !map.has(name)) map.set(name, { id: c?.id, name })
         }
      }
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'))
   }, [list])

   const getNumericPrice = (item) => {
      const raw = item?.price ?? item?.Price?.amount ?? item?.amount
      if (raw == null) return null
      const n = Number(String(raw).replace(/,/g, ''))
      return Number.isNaN(n) ? null : n
   }

   const filteredList = useMemo(
      () =>
         filterItems(list, {
            selectedCategories: selectedCats,
            sellStatus: sellStatus === 'all' ? '' : sellStatus,
            inStockOnly,
            priceMin,
            priceMax,
         }),
      [list, selectedCats, sellStatus, inStockOnly, priceMin, priceMax]
   )

   // ---- 선택 카테고리 ----
   // ---- Early return (모든 훅 이후) ----
   if (loading) return <Spinner text="상품 데이터를 불러오는 중..." />
   if (error) return <p>에러가 발생했습니다.: {String(error)}</p>

   // ---- Helpers ----
   const resolveImage = (item) => {
      const rep = item?.ItemImages?.find((img) => img?.repImgYn === 'Y') ?? item?.ItemImages?.[0]
      const url = rep?.imgUrl
      if (!url) return getPlaceholderImage()
      return /^https?:\/\//i.test(url) ? url : `${baseURL}${url}`
   }

   const formatPrice = (v) => {
      if (v == null) return null
      const n = Number(String(v).replace(/,/g, ''))
      if (Number.isNaN(n)) return null
      return new Intl.NumberFormat('ko-KR').format(n)
   }

   const statusOptions = [
      { value: 'all', label: '전체' },
      { value: 'SELL', label: '판매중' },
      { value: 'SOLD_OUT', label: '품절' },
   ]

   const onClickDelete = (itemId) => {
      if (!itemId) return
      confirmModal.open({
         title: '삭제 확인',
         message: '정말 삭제하시겠습니까?',
         confirmText: '삭제',
         cancelText: '취소',
         variant: 'danger',
         onConfirm: () => {
            dispatch(deleteItemThunk(itemId))
               .unwrap()
               .then(() => {
                  alertModal.open({
                     title: '완료',
                     message: '상품이 삭제되었습니다!',
                     variant: 'success',
                  })
                  dispatch(fetchItemsThunk({ searchTerm, sellCategory }))
               })
               .catch(() => {
                  alertModal.open({
                     title: '오류',
                     message: '상품 삭제 중 오류 발생',
                     variant: 'danger',
                  })
               })
         },
      })
   }

   // ---- Render ----
   return (
      <AdminPanelLayout
         title="상품 관리"
         actions={
            <Button size="sm" onClick={() => navigate('/items/create')}>
               상품 등록
            </Button>
         }
      >
         <SectionCard
            title="상품 필터"
            className="section-card--overflow-visible"
            collapsible
            isOpen={filterOpen}
            headerActions={
               <button
                  type="button"
                  className="filter-form__toggle btn btn-link p-0 text-white"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  aria-expanded={filterOpen}
                  aria-label="필터 토글"
               >
                 <Icon icon="mdi:tune-variant" width="24" height="24" style={{ color: 'white' }}/>
               </button>
            }
         >
            {filterOpen && (
               <FilterForm
                  categoryOptions={allCategories}
                  statusOptions={statusOptions}
                  values={{
                     selectedCats,
                     priceMin,
                     priceMax,
                     status: sellStatus,
                     inStockOnly,
                  }}
                  onChange={{
                     setSelectedCats,
                     setPriceMin,
                     setPriceMax,
                     setStatus: setSellStatus,
                     setInStockOnly,
                  }}
                  showCategory
                  showPrice
                  showStatus
                  showStockToggle
                  variant="admin"
               />
            )}
         </SectionCard>

         <div className="row align-items-center gx-3 gy-2 mt-3 mb-4">
            <div className="col-auto">
               <p className="item-count mb-0">상품 {filteredList.length}개</p>
            </div>
         </div>

         <div className="row g-3 g-md-4 flex-grow-1">
            {filteredList.map((item, idx) => {
               const categories = (item?.Categories ?? []).map((c) => c?.categoryName ?? c?.name).filter(Boolean)
               const rawPrice = item?.price ?? item?.Price?.amount ?? item?.amount
               const prettyPrice = formatPrice(rawPrice)
               const priceLabel = prettyPrice ? `₩${prettyPrice}` : '가격 정보 없음'
               const isSoldOut = (item?.itemSellStatus ?? item?.sellStatus) === 'SOLD_OUT'
               const overlayStart = isSoldOut ? (
                  <span className="badge text-bg-danger rounded-pill shadow-sm">품절</span>
               ) : null

               return (
                  <div className="col-6 col-md-4 col-lg-3 d-flex" key={item?.id ?? idx}>
                     <ItemCard
                        imageUrl={resolveImage(item)}
                        title={item?.itemNm ?? '상품'}
                        tags={categories}
                        priceLabel={priceLabel}
                        overlayStart={overlayStart}
                        className="w-100"
                        footer={
                           <div className="d-flex gap-2">
                              <Button
                                 size="sm"
                                 variant="secondary"
                                 onClick={() => {
                                    if (item?.id) {
                                       navigate(`/items/edit/${item.id}`)
                                    }
                                 }}
                              >
                                 수정
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => onClickDelete(item?.id)}>
                                 삭제
                              </Button>
                           </div>
                        }
                     />
                  </div>
               )
            })}

            {!filteredList.length && !loading && (
               <div className="col">
                  <div className="alert alert-secondary bg-transparent border-0" role="status">
                     데이터가 없습니다.
                  </div>
               </div>
            )}
         </div>
         <AlertModal
            open={alertModal.isOpen}
            onClose={alertModal.close}
            title={alertModal.config.title}
            message={alertModal.config.message}
            buttonText={alertModal.config.buttonText}
            variant={alertModal.config.variant}
         />
         <ConfirmModal
            open={confirmModal.isOpen}
            onClose={confirmModal.close}
            onConfirm={confirmModal.confirm}
            title={confirmModal.config.title}
            message={confirmModal.config.message}
            confirmText={confirmModal.config.confirmText}
            cancelText={confirmModal.config.cancelText}
            variant={confirmModal.config.variant}
         />
      </AdminPanelLayout>
   )
}

export default ItemPanel

