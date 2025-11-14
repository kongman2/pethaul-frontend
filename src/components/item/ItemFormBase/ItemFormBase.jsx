import './ItemFormBase.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatWithComma, stripComma } from '../../../utils/priceSet'
import { Button, Input, Textarea, SectionCard, ImageUpload, Selector, AlertModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'

// initialData 유연 정규화
function normalize(raw) {
  if (!raw) return null
  return {
    id: raw.id ?? raw.itemId ?? null,
    itemNm: raw.itemNm ?? raw.name ?? raw.itemName ?? '',
    price: raw.price ?? raw.amount ?? raw.itemPrice ?? '',
    stockNumber: raw.stockNumber ?? raw.stock ?? raw.quantity ?? '',
    itemSellStatus: raw.itemSellStatus ?? raw.status ?? 'SELL',
    itemDetail: raw.itemDetail ?? raw.description ?? '',
    itemSummary: raw.itemSummary ?? raw.summary ?? '',
    ItemImages: raw.ItemImages ?? raw.images ?? raw.photos ?? [],
    Categories: (raw.Categories ?? raw.categories ?? []).map((c) => (typeof c === 'string' ? { categoryName: c } : { categoryName: c?.categoryName ?? c?.name ?? '' })),
  }
}

const toAbs = (base, url) => {
  if (!url) return ''
  const u = String(url).trim()
  if (/^https?:\/\//i.test(u)) return u
  const left = (base || '').replace(/\/+$/, '')
  const right = u.replace(/^\/+/, '')
  return `${left}/${right}`
}

const POPULAR_CATEGORY_OPTIONS = [
  { value: '강아지', label: '강아지' },
  { value: '고양이', label: '고양이' },
  { value: '햄스터/고슴도치', label: '햄스터/고슴도치' },
  { value: '새', label: '새' },
  { value: '물고기/기타동물', label: '물고기/기타동물' },
  { value: '사료', label: '사료' },
  { value: '간식', label: '간식' },
  { value: '장난감', label: '장난감' },
  { value: '산책용품', label: '산책용품' },
  { value: '의류', label: '의류' },
  { value: '위생용품', label: '위생용품' },
  { value: '건강관리', label: '건강관리' },
  { value: '미용용품', label: '미용용품' },
  { value: '생활용품', label: '생활용품' },
]

const normalizeCategoryName = (name) => {
  if (!name) return ''
  return String(name).replace(/^#+/, '').trim()
}

function ItemFormBase({
  mode = 'create',
  initialData = null,
  onSubmit,
}) {
  const apiBase = import.meta.env.VITE_APP_API_URL
  const { alert, alertModal } = useModalHelpers()

  const formMode = initialData ? 'edit' : String(mode || 'create').trim().toLowerCase()
  const finalSubmitLabel = formMode === 'edit' ? '수정하기' : '등록하기'

  if (formMode === 'edit' && !initialData) return null

  const norm = useMemo(() => (formMode === 'edit' && initialData ? normalize(initialData) : null), [formMode, initialData])

  const initialServerImgUrls = useMemo(() => {
    if (!norm) return []
    return (norm.ItemImages || [])
      .map((img) => (typeof img === 'string' ? img : img?.imgUrl))
      .filter(Boolean)
      .map((u) => toAbs(apiBase, u))
  }, [norm, apiBase])

  const initialSelectedCategories = useMemo(() => {
    if (!norm) return []
    const names = (norm.Categories || [])
      .map((c) => normalizeCategoryName(c.categoryName))
      .filter(Boolean)
    return Array.from(new Set(names))
  }, [norm])

  const [imgUrls, setImgUrls] = useState(initialServerImgUrls)
  const [imgFiles, setImgFiles] = useState([])
  const [imgError, setImgError] = useState('')
  const [itemNm, setItemNm] = useState(norm?.itemNm ?? '')
  const [price, setPrice] = useState(String(norm?.price ?? ''))
  const [stockNumber, setStockNumber] = useState(String(norm?.stockNumber ?? ''))
  const [itemSellStatus, setItemSellStatus] = useState(norm?.itemSellStatus ?? 'SELL')
  const [itemDetail, setItemDetail] = useState(norm?.itemDetail ?? '')
  const [itemSummary, setItemSummary] = useState(norm?.itemSummary ?? '')
  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories)
  const [customCategoryInput, setCustomCategoryInput] = useState('')

  useEffect(() => {
    if (formMode !== 'edit' || !norm) return
    setImgUrls(initialServerImgUrls)
    setImgFiles([])
    setItemNm(norm.itemNm ?? '')
    setPrice(String(norm.price ?? ''))
    setStockNumber(String(norm.stockNumber ?? ''))
    setItemSellStatus(norm.itemSellStatus ?? 'SELL')
    setItemDetail(norm.itemDetail ?? '')
    setItemSummary(norm.itemSummary ?? '')
    setSelectedCategories(initialSelectedCategories)
    setCustomCategoryInput('')
  }, [formMode, norm, initialServerImgUrls, initialSelectedCategories])

  const prevUrlsRef = useRef([])
  useEffect(() => () => prevUrlsRef.current.forEach((u) => URL.revokeObjectURL(u)), [])

  const handleNumeric = (raw) => {
    const numeric = stripComma(raw)
    if (!/^\d*$/.test(numeric)) return null
    return numeric
  }

  const handleImageChange = (files) => {
    setImgError('')
    if (!files.length) return

    const MAX = 5
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']

    const valid = files.filter((f) => ALLOWED.includes(f.type))
    if (valid.length !== files.length) {
      setImgError('이미지 파일만 업로드할 수 있어요 (jpg/png/webp/gif).')
    }

    const key = (f) => `${f.name}_${f.size}_${f.lastModified}`
    const existingKeys = new Set(imgFiles.map(key))
    const unique = valid.filter((f) => !existingKeys.has(key(f)))

    const remain = MAX - imgUrls.length
    if (remain <= 0) {
      setImgError(`최대 ${MAX}장까지 업로드할 수 있어요.`)
      return
    }

    const toAdd = unique.slice(0, remain)

    const newUrls = toAdd.map((f) => {
      const u = URL.createObjectURL(f)
      prevUrlsRef.current.push(u)
      return u
    })

    setImgFiles((prev) => [...prev, ...toAdd])
    setImgUrls((prev) => [...prev, ...newUrls])
  }

  const handleImageRemove = (index) => {
    setImgUrls((prev) => prev.filter((_, i) => i !== index))
    setImgFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePriceChange = (raw) => {
    const n = handleNumeric(raw)
    if (n !== null) setPrice(n)
  }

  const handleStockChange = (raw) => {
    const n = handleNumeric(raw)
    if (n !== null) setStockNumber(n)
  }

  const buildFormData = () => {
    const fd = new FormData()
    if (formMode === 'edit' && norm?.id != null) fd.append('id', String(norm.id))

    fd.append('itemNm', itemNm)
    fd.append('price', String(price))
    fd.append('stockNumber', String(stockNumber))
    fd.append('itemSellStatus', itemSellStatus)
    fd.append('itemDetail', itemDetail)
    fd.append('itemSummary', itemSummary)

    if (imgFiles?.length) {
      imgFiles.forEach((file) => {
        const encoded = new File([file], encodeURIComponent(file.name), { type: file.type })
        fd.append('img', encoded)
      })
    }
    fd.append('categories', JSON.stringify(normalizedSelectedCategories))
    return fd
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (typeof onSubmit !== 'function') {
      alert('수정 핸들러(onSubmit)가 연결되지 않았습니다.')
      return
    }

    try {
      if (!itemNm.trim()) return alert('상품명을 입력하세요!')
      if (!String(price).trim()) return alert('가격을 입력하세요!')
      if (!String(stockNumber).trim()) return alert('재고를 입력하세요.')
      if (formMode === 'create' && (!imgFiles || imgFiles.length === 0)) {
        return alert('이미지는 최소 1개 이상 업로드 하세요.')
      }

      const fd = buildFormData()
      await onSubmit(fd)
    } catch (err) {
      alert(err?.message || '수정 중 오류가 발생했습니다.')
    }
  }

  const sellStatusOptions = useMemo(
    () => [
      { value: 'SELL', label: '판매중' },
      { value: 'SOLD_OUT', label: '품절' },
    ],
    []
  )

  const selectedPopularValues = useMemo(
    () =>
      selectedCategories.filter((cat) =>
        POPULAR_CATEGORY_OPTIONS.some((opt) => opt.value === cat),
      ),
    [selectedCategories],
  )

  const normalizedSelectedCategories = useMemo(
    () => Array.from(new Set(selectedCategories.map(normalizeCategoryName).filter(Boolean))),
    [selectedCategories],
  )

  const handlePopularCategoryChange = (values = []) => {
    const normalized = Array.isArray(values) ? values.map(normalizeCategoryName).filter(Boolean) : []
    setSelectedCategories((prev) => {
      const custom = prev.filter((cat) => !POPULAR_CATEGORY_OPTIONS.some((opt) => opt.value === cat))
      return Array.from(new Set([...normalized, ...custom]))
    })
  }

  const handleAddCustomCategory = () => {
    const normalized = normalizeCategoryName(customCategoryInput)
    if (!normalized) return
    setSelectedCategories((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]))
    setCustomCategoryInput('')
  }

  const handleCustomCategoryKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleAddCustomCategory()
    }
  }

  const handleRemoveCategory = (category) => {
    const normalized = normalizeCategoryName(category)
    setSelectedCategories((prev) => prev.filter((cat) => cat !== normalized))
  }

  return (
    <section className="container py-5">
      <h1 className="section-title text-center text-lg-start mb-4">
        {formMode === 'edit' ? '상품 수정' : '상품 등록'}
      </h1>

      <SectionCard
        title={formMode === 'edit' ? '상품 정보를 수정해주세요.' : '상품 정보를 입력해주세요.'}
        headerActions={null}
        bodyClassName="p-4"
        className="section-card--overflow-visible"
      >
        <form encType="multipart/form-data" onSubmit={handleSubmit}>
          <div className="row g-4">
            {/* 이미지 업로드 */}
            <div className="col-12">
              <ImageUpload
                label="상품 이미지"
                required
                multiple
                maxFiles={5}
                previewUrls={imgUrls}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
                error={imgError}
                hint="jpg, png, webp, gif 형식의 이미지를 업로드해주세요."
                id="item-images"
              />
            </div>

            {/* 상품명 */}
            <div className="col-12 col-md-6">
              <label htmlFor="item-name" className="form-label fw-semibold">
                상품명 <span className="text-danger">*</span>
              </label>
              <Input
                id="item-name"
                type="text"
                placeholder="상품명을 입력해주세요"
                value={itemNm}
                onChange={setItemNm}
                maxLength={50}
                required
              />
            </div>

            {/* 카테고리 */}
            <div className="col-12 col-md-6">
              <label htmlFor="item-category" className="form-label fw-semibold">
                상품 카테고리
              </label>
              <Selector
                id="item-category"
                name="item-category"
                multiple
                options={POPULAR_CATEGORY_OPTIONS}
                value={selectedPopularValues}
                onChange={handlePopularCategoryChange}
                placeholder="자주 사용하는 카테고리를 선택하세요"
              />
              <div className="category-actions d-flex gap-2 align-items-center mt-2">
                <Input
                  id="item-category-custom"
                  type="text"
                  placeholder="직접 태그 입력 (예: 하네스)"
                  value={customCategoryInput}
                  onChange={setCustomCategoryInput}
                  onKeyDown={handleCustomCategoryKeyDown}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddCustomCategory}>
                  추가
                </Button>
              </div>
              <small className="text-muted d-block mt-1">
                원하는 카테고리를 선택하거나 직접 입력하여 태그를 추가하세요.
              </small>
              {normalizedSelectedCategories.length > 0 && (
                <div className="category-tag-list mt-2">
                  {normalizedSelectedCategories.map((category) => (
                    <span key={category} className="category-tag">
                      {category}
                      <button
                        type="button"
                        className="category-tag__remove"
                        onClick={() => handleRemoveCategory(category)}
                        aria-label={`${category} 태그 삭제`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 가격 */}
            <div className="col-12 col-md-4">
              <label htmlFor="item-price" className="form-label fw-semibold">
                가격 <span className="text-danger">*</span>
              </label>
              <Input
                id="item-price"
                type="text"
                inputMode="numeric"
                placeholder="가격을 입력해주세요"
                value={formatWithComma(price)}
                onChange={handlePriceChange}
                maxLength={15}
                required
              />
            </div>

            {/* 재고/수량 */}
            <div className="col-12 col-md-4">
              <label htmlFor="item-stock" className="form-label fw-semibold">
                재고/수량 <span className="text-danger">*</span>
              </label>
              <Input
                id="item-stock"
                type="text"
                inputMode="numeric"
                placeholder="수량을 입력해주세요"
                value={stockNumber}
                onChange={handleStockChange}
                maxLength={10}
                required
              />
            </div>

            {/* 판매 상태 */}
            <div className="col-12 col-md-4">
              <label htmlFor="item-sell-status" className="form-label fw-semibold">
                판매 상태 <span className="text-danger">*</span>
              </label>
              <Selector
                id="item-sell-status"
                name="itemSellStatus"
                value={itemSellStatus}
                onChange={setItemSellStatus}
                options={sellStatusOptions}
                placeholder="판매 상태 선택"
              />
            </div>

            {/* 상품 요약 */}
            <div className="col-12">
              <label htmlFor="item-summary" className="form-label fw-semibold">
                상품 요약
              </label>
              <Textarea
                id="item-summary"
                placeholder="상품을 간단히 소개해주세요 (500자 이내)"
                value={itemSummary}
                onChange={setItemSummary}
                rows={3}
                maxLength={500}
                showCounter
              />
            </div>

            {/* 상품 상세 설명 */}
            <div className="col-12">
              <label htmlFor="item-detail" className="form-label fw-semibold">
                상품 상세 설명
              </label>
              <Textarea
                id="item-detail"
                placeholder="상품에 대한 자세한 설명을 작성해주세요"
                value={itemDetail}
                onChange={setItemDetail}
                rows={8}
              />
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="d-flex justify-content-end mt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
            >
              {finalSubmitLabel}
            </Button>
          </div>
        </form>
      </SectionCard>
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

export default ItemFormBase
