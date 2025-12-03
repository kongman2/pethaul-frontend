import './ItemFormBase.scss'
import { useEffect, useMemo, useRef, useState } from 'react'
import { formatWithComma, stripComma } from '../../../utils/priceSet'
import { Button, Input, Textarea, SectionCard, ImageUpload, Selector, AlertModal, RichTextEditor } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { uploadContentImageApi } from '../../../api/contentApi'
import { RECOMMENDATION_TAGS } from '../../../utils/recommendationUtils'
import { MAIN_CATEGORY_OPTIONS } from '../../../constants/itemCategories'
import { buildImageUrl } from '../../../utils/imageUtils'

// 상품 카테고리와 추천 상품 태그를 합친 옵션 
const ALL_CATEGORY_OPTIONS = (() => {
  const mainValues = new Set(MAIN_CATEGORY_OPTIONS.map(opt => opt.value))
  const recommendationOptions = RECOMMENDATION_TAGS
    .filter(tag => !mainValues.has(tag)) // 이미 MAIN_CATEGORY_OPTIONS에 있는 값은 제외
    .map(tag => ({ value: tag, label: tag, group: '추천태그' }))
  
  return [
    ...MAIN_CATEGORY_OPTIONS,
    ...recommendationOptions
  ]
})()

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
    discountPercent: raw.discountPercent ?? 0,
    ItemImages: raw.ItemImages ?? raw.images ?? raw.photos ?? [],
    Categories: (raw.Categories ?? raw.categories ?? []).map((c) => (typeof c === 'string' ? { categoryName: c } : { categoryName: c?.categoryName ?? c?.name ?? '' })),
  }
}

// 통일된 이미지 처리: buildImageUrl 사용
const toAbs = (base, url) => {
  if (!url) return ''
  return buildImageUrl(url)
}

const normalizeCategoryName = (name) => {
  if (!name) return ''
  return String(name).replace(/^#+/, '').trim()
}

function ItemFormBase({
  mode = 'create',
  initialData = null,
  onSubmit,
}) {
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
      .map((u) => toAbs(null, u)) // base 파라미터는 더 이상 사용하지 않음 (buildImageUrl이 내부에서 처리)
  }, [norm])

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
  const [discountPercent, setDiscountPercent] = useState(String(norm?.discountPercent ?? '0'))
  const [selectedCategories, setSelectedCategories] = useState(initialSelectedCategories)

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
    setDiscountPercent(String(norm.discountPercent ?? '0'))
    setSelectedCategories(initialSelectedCategories)
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

  const handleDiscountChange = (raw) => {
    const n = handleNumeric(raw)
    if (n !== null) {
      // 0-100 사이로 제한
      const clamped = Math.min(Math.max(parseInt(n, 10) || 0, 0), 100)
      setDiscountPercent(String(clamped))
    }
  }

  // 할인 가격 계산
  const calculateDiscountedPrice = useMemo(() => {
    const priceNum = parseInt(stripComma(price), 10) || 0
    const discountNum = parseInt(discountPercent, 10) || 0
    if (priceNum === 0 || discountNum === 0) return null
    const discounted = Math.floor(priceNum * (1 - discountNum / 100))
    return formatWithComma(String(discounted))
  }, [price, discountPercent])

  const buildFormData = () => {
    const fd = new FormData()
    if (formMode === 'edit' && norm?.id != null) fd.append('id', String(norm.id))

    fd.append('itemNm', itemNm)
    fd.append('price', String(price))
    fd.append('stockNumber', String(stockNumber))
    fd.append('itemSellStatus', itemSellStatus)
    fd.append('itemDetail', itemDetail)
    fd.append('itemSummary', itemSummary)
    fd.append('discountPercent', String(discountPercent || '0'))

    if (imgFiles?.length) {
      imgFiles.forEach((file) => {
        const encoded = new File([file], encodeURIComponent(file.name), { type: file.type })
        fd.append('img', encoded)
      })
    }
    
    // 카테고리 및 태그 전송
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

  const selectedCategoryValues = useMemo(
    () => selectedCategories.map(normalizeCategoryName).filter(Boolean),
    [selectedCategories],
  )

  const normalizedSelectedCategories = useMemo(
    () => Array.from(new Set(selectedCategories.map(normalizeCategoryName).filter(Boolean))),
    [selectedCategories],
  )

  const handleCategoryChange = (values = []) => {
    const normalized = Array.isArray(values) ? values.map(normalizeCategoryName).filter(Boolean) : []
    setSelectedCategories(normalized)
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
                hint="jpg, png, webp, gif 형식의 이미지를 업로드해주세요. (정사각형 비율 권장)"
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

            {/* 가격 */}
            <div className="col-12 col-md-6">
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

            {/* 상품 카테고리 및 추천 태그 (통합) */}
            <div className="col-12">
              <label htmlFor="item-category" className="form-label fw-semibold">
                상품 카테고리 및 태그 <span className="text-danger">*</span>
              </label>
              <Selector
                id="item-category"
                name="item-category"
                multiple
                options={ALL_CATEGORY_OPTIONS}
                value={selectedCategoryValues}
                onChange={handleCategoryChange}
                placeholder="카테고리 및 태그를 선택하세요 (여러 개 선택 가능)"
              />
              {normalizedSelectedCategories.length > 0 && (
                <div className="category-tag-list mt-3">
                  <small className="text-muted d-block mb-2">선택된 카테고리 및 태그:</small>
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

            {/* 할인율 */}
            <div className="col-12 col-md-4">
              <label htmlFor="item-discount" className="form-label fw-semibold">
                할인율 (%)
              </label>
              <Input
                id="item-discount"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={discountPercent}
                onChange={handleDiscountChange}
                maxLength={3}
                rightButton={{
                  text: '%',
                  disabled: true,
                  variant: 'outline',
                  size: 'sm',
                }}
              />
              {calculateDiscountedPrice && (
                <small className="text-muted d-block mt-1">
                  할인 가격: ₩{calculateDiscountedPrice} (원가 ₩{formatWithComma(price)}에서 {discountPercent}% 할인)
                </small>
              )}
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
              <RichTextEditor
                label="상품 상세 설명"
                id="item-detail"
                value={itemDetail}
                onChange={(html) => setItemDetail(html)}
                placeholder="상품에 대한 자세한 설명을 작성해주세요. 이미지와 링크를 넣을 수 있어요!"
                onImageUpload={async (file) => {
                  try {
                    // 컨텐츠 이미지 업로드 API 재사용
                    const result = await uploadContentImageApi(file)
                    return result.url
                  } catch (error) {
                    alert('이미지 업로드에 실패했습니다.', '오류', 'danger')
                    throw error
                  }
                }}
                hint="텍스트 서식, 이미지, 링크를 추가할 수 있습니다."
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
