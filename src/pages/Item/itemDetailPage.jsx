import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'

import { fetchItemByIdThunk } from '../../features/itemSlice'
import { addToCartThunk } from '../../features/cartSlice'
import { createQnaThunk } from '../../features/qnaSlice'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'
import { getPlaceholderImage } from '../../utils/imageUtils'

import ItemReviewList from '../../components/review/ItemReviewList'
import { Button, Input, SectionCard, QuantityControl, AlertModal } from '../../components/common'
import 발바닥Img from '../../assets/발바닥.png'

import './itemDetailPage.scss'

function ItemDetailPage() {
  useAppBackground('app-bg--blue')
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { item, loading, error } = useSelector((state) => state.item)
  const { alert, alertModal } = useModalHelpers()

  useEffect(() => {
    if (id) {
      dispatch(fetchItemByIdThunk(id))
    }
  }, [id, dispatch])

  const [quantity, setQuantity] = useState(1)
  const [inquiry, setInquiry] = useState({ name: '', contact: '', content: '', isPrivate: false })
  const [showFullSummary, setShowFullSummary] = useState(false)
  const [openSections, setOpenSections] = useState({ review: true, detail: true, inquiry: false })
  const { user } = useSelector((state) => state.auth || {})

  const repImg = useMemo(() => (Array.isArray(item?.ItemImages) ? item.ItemImages.find((img) => img.repImgYn === 'Y') : null), [item?.ItemImages])
  const subImgs = useMemo(() => (Array.isArray(item?.ItemImages) ? item.ItemImages.filter((img) => img.repImgYn === 'N') : []), [item?.ItemImages])
  const apiBase = import.meta.env.VITE_APP_API_URL || ''

  const thumbSrcs = useMemo(() => {
    const list = []
    if (repImg?.imgUrl) list.push(`${apiBase}${repImg.imgUrl}`)
    for (const img of subImgs) list.push(`${apiBase}${img.imgUrl}`)
    return Array.from(new Set(list))
  }, [repImg, subImgs, apiBase])

  const [mainSrc, setMainSrc] = useState(thumbSrcs[0] || getPlaceholderImage())

  useEffect(() => {
    setMainSrc(thumbSrcs[0] || getPlaceholderImage())
  }, [thumbSrcs])

  const { avgRating, reviewCount } = useMemo(() => {
    const list = Array.isArray(item?.Reviews) ? item.Reviews : []
    const valid = list.filter((r) => r?.rating !== null && r?.rating !== undefined)
    const total = valid.reduce((sum, r) => sum + Number(r.rating || 0), 0)
    const count = valid.length
    const avg = count ? total / count : 0
    return { avgRating: Math.round(avg * 10) / 10, reviewCount: count }
  }, [item?.Reviews])

  const maxOrderQty = useMemo(() => {
    const stock = Number(item?.stockNumber ?? item?.stock ?? 0)
    if (Number.isFinite(stock) && stock > 0) return stock
    return 99
  }, [item?.stockNumber, item?.stock])

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCartThunk({ itemId: item.id, count: quantity })).unwrap()
      alert('장바구니에 추가되었습니다.', '완료', 'success')
    } catch (err) {
      alert(`장바구니 추가 실패: ${err}`, '오류', 'danger')
    }
  }

  const handleInquiryChange = (name, value) => {
    setInquiry((prev) => ({ ...prev, [name]: value }))
  }

  const submitInquiry = async (e) => {
    e.preventDefault()
    if (!inquiry.content.trim()) {
      alert('문의 내용을 입력해 주세요.', '입력 필요', 'warning')
      return
    }
    
    if (!user) {
      alert('로그인이 필요합니다.', '로그인 필요', 'warning')
      navigate('/login')
      return
    }

    try {
      await dispatch(
        createQnaThunk({
          title: `[상품문의] ${item?.itemNm || ''}`,
          content: inquiry.content,
          itemId: item?.id,
          isPrivate: inquiry.isPrivate,
        })
      ).unwrap()
      alert('문의가 등록되었습니다.', '완료', 'success')
      setInquiry({ name: '', contact: '', content: '', isPrivate: false })
    } catch (error) {
      alert(error || '문의 등록 중 오류가 발생했습니다.', '오류', 'danger')
    }
  }

  const categoriesLabel = useMemo(() => {
    if (!Array.isArray(item?.Categories) || item.Categories.length === 0) return 'CATEGORY'
    return item.Categories.map((c) => c.categoryName).filter(Boolean).join(' → ')
  }, [item?.Categories])

  const price = Number(item?.price) || 0
  const discountRate = item?.discountRate ?? item?.discountPercent ?? null
  const summaryText = item?.itemSummary ?? ''
  const summaryNeedsToggle = summaryText.replace(/\s+/g, '').length > 80

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  if (loading) {
    return (
      <div className="container py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-5">
        <p className="text-danger m-0">{String(error)}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="container py-5">
        <p className="m-0">상품 정보를 불러올 수 없습니다.</p>
      </div>
    )
  }

  return (
    <section className="container py-5">
      <div className="row g-4 g-lg-5 align-items-center">
        <div className="col-12 col-lg-6">
          <div className="d-flex flex-column flex-lg-row gap-3">
            <div className="item-detail__thumbs d-flex flex-row flex-lg-column gap-2 justify-content-center">
              {thumbSrcs.map((src, index) => {
                const active = mainSrc === src
                return (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    className={`item-detail__thumb ${active ? 'is-active' : ''}`}
                    onClick={() => setMainSrc(src)}
                    aria-label={`상품 썸네일 ${index + 1}`}
                  >
                    <img src={src} alt={`상품 썸네일 ${index + 1}`} />
                  </button>
                )
              })}
            </div>

            <div className="flex-grow-1">
              <div className="ratio ratio-1x1 item-detail__main-frame">
                <img src={mainSrc} alt="대표 상품 이미지" className="w-100 h-100" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
            <div className="d-flex flex-column h-100 p-4">
              <div className="p-2 d-flex flex-column gap-2">
                <span className="item-detail__category">#{categoriesLabel}</span>
                <h4 className="item-detail__title mb-0">{item.itemNm || '상품명 없음'}</h4>
                {discountRate != null ? <span className="item-detail__discount">{discountRate}%</span> : null}
                <strong className="item-detail__price">{price.toLocaleString()}원</strong>
              </div>

              {summaryText ? (
                <div className="p-2 d-flex flex-column gap-2">
                  <p className={`item-detail__summary${showFullSummary ? ' is-open' : ''}`}>{summaryText}</p>
                  {summaryNeedsToggle ? (
                    <button
                      type="button"
                      className="item-detail__summary-toggle"
                      onClick={() => setShowFullSummary((prev) => !prev)}
                    >
                      {showFullSummary ? '간단히 보기' : '더보기'}
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="row g-2 mt-3">
                <div className="col-auto">
                  <span className="item-detail__qty-label">수량</span>
                </div>
                <div className="col-auto">
                  <QuantityControl
                    value={quantity}
                    min={1}
                    max={maxOrderQty}
                    onChange={(next) => setQuantity(next)}
                    editable={false}
                    className="item-detail__qty-control"
                  />
                </div>
                <div className="col item-detail__total">총 {(price * quantity).toLocaleString()}원</div>
              </div>

              {item.itemSellStatus === 'SELL' ? (
                <div className="d-flex flex-column gap-2 mt-3">
                  <Button variant="cart" size="lg" onClick={handleAddToCart}>
                    장바구니
                  </Button>
                  <Button
                    variant="buy"
                    size="lg"
                    onClick={() =>
                      navigate('/order', {
                        state: { item: [{ itemId: item.id, price: Number(item.price) || 0, quantity }] },
                      })
                    }
                  >
                    구매하기
                    <img src={발바닥Img} alt="Click" className="item-detail__btn-icon" />
                  </Button>
                </div>
              ) : (
                <p className="item-detail__soldout">품절된 상품입니다.</p>
              )}
            </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-3 mt-5">
        <SectionCard
          className={`item-detail__section-card ${openSections.review ? 'is-open' : 'is-closed'}`}
          title={
            <span>
              REVIEW
              <span className="ms-3">
                <strong>{avgRating.toFixed(1)}</strong> / {reviewCount}건
              </span>
            </span>
          }
          headerActions={
            <button type="button" className="item-detail__card-toggle" onClick={() => toggleSection('review')} aria-expanded={openSections.review}>
              {openSections.review ? '-' : '+'}
            </button>
          }
        >
          {openSections.review ? <ItemReviewList item={item} /> : null}
        </SectionCard>

        <SectionCard
          className={`item-detail__section-card ${openSections.detail ? 'is-open' : 'is-closed'}`}
          title="상품설명"
          headerActions={
            <button type="button" className="item-detail__card-toggle" onClick={() => toggleSection('detail')} aria-expanded={openSections.detail}>
              {openSections.detail ? '-' : '+'}
            </button>
          }
        >
          {openSections.detail ? (
            item.itemDetail ? (
              <div 
                className="item-detail__panel-text mb-0" 
                dangerouslySetInnerHTML={{ __html: item.itemDetail }}
              />
            ) : (
              <p className="item-detail__panel-text mb-0">상세 설명이 없습니다.</p>
            )
          ) : null}
        </SectionCard>

        <SectionCard
          className={`item-detail__section-card ${openSections.inquiry ? 'is-open' : 'is-closed'}`}
          title="상품문의"
          headerActions={
            <button type="button" className="item-detail__card-toggle" onClick={() => toggleSection('inquiry')} aria-expanded={openSections.inquiry}>
              {openSections.inquiry ? '-' : '+'}
            </button>
          }
        >
          {openSections.inquiry ? (
            <form className="row g-3" onSubmit={submitInquiry}>
              <div className="col-12 col-md-6">
                <label htmlFor="inq-name" className="mb-2">
                  이름
                </label>
                <Input
                  id="inq-name"
                  name="name"
                  placeholder="이름(선택)"
                  value={inquiry.name}
                  onChange={(value) => handleInquiryChange('name', value)}
                />
              </div>
              <div className="col-12 col-md-6">
                <label htmlFor="inq-contact" className="mb-2">
                  연락처
                </label>
                <Input
                  id="inq-contact"
                  name="contact"
                  placeholder="이메일 또는 전화번호(선택)"
                  value={inquiry.contact}
                  onChange={(value) => handleInquiryChange('contact', value)}
                />
              </div>
              <div className="col-12">
                <label htmlFor="inq-content" className="mb-2">
                  문의 내용
                </label>
                <Input
                  id="inq-content"
                  name="content"
                  placeholder="상품에 대한 문의를 작성해 주세요."
                  value={inquiry.content}
                  onChange={(value) => handleInquiryChange('content', value)}
                  required
                  as="textarea"
                  rows={5}
                />
              </div>
              <div className="col-12 d-flex flex-wrap align-items-center justify-content-between gap-3">
                <label className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPrivate"
                    id="inq-private"
                    checked={inquiry.isPrivate}
                    onChange={(e) => handleInquiryChange('isPrivate', e.target.checked)}
                  />
                  <span>비공개</span>
                </label>
                <Button type="submit" variant="primary" size="md">
                  문의 등록
                </Button>
              </div>
            </form>
          ) : null}
        </SectionCard>
      </div>
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

export default ItemDetailPage
