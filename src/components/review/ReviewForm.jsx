import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

import { createReviewThunk, updateReviewThunk } from '../../features/reviewSlice'

import { Textarea, Button, SectionCard, ImageUpload } from '../common'

import './ReviewForm.scss'

/**
 * 통합 리뷰 폼
 * props:
 *  - mode: 'create' | 'edit'
 *  - item: 생성 모드에서 필요한 상품 객체 { id, itemNm }
 *  - review: 수정 모드에서 필요한 리뷰 객체 { id, rating, reviewContent, Item:{ id, itemNm }, ... }
 *  - reviewId: (선택) 수정 모드에서 id 별도 전달 시
 *  - onSuccess: 성공 시 이동 경로 (기본: '/myreviewlist')
 *  - existingImgs: 수정 시 서버에 이미 등록된 이미지 URL 배열(선택)
 */
export default function ReviewForm({
  mode = 'create',
  item,
  review,
  reviewId,
  onSuccess = '/myreviewlist',
  existingImgs = [],
}) {
  const isEdit = mode === 'edit'
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const itemName = isEdit ? review?.Item?.itemNm : item?.itemNm
  const itemId = isEdit ? review?.Item?.id : item?.id
  const initialRating = isEdit ? Number(review?.rating ?? 0) : 0
  const initialContent = isEdit ? (review?.reviewContent ?? '') : ''

  // 상태
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(initialRating)
  const [reviewContent, setReviewContent] = useState(initialContent)

  // 새로 첨부하는 이미지 & 미리보기
  const [reviewImages, setReviewImages] = useState([])   // File[]
  const [imgUrls, setImgUrls] = useState(existingImgs)   // string[]
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' }) // 'error' | 'success'

  // existingImgs가 변경될 때 imgUrls 업데이트
  useEffect(() => {
    if (Array.isArray(existingImgs) && existingImgs.length > 0) {
      // 이미지 URL을 절대 경로로 변환
      const apiBase = (import.meta.env.VITE_APP_API_URL || '').replace(/\/$/, '')
      const absoluteUrls = existingImgs.map((url) => {
        if (!url) return ''
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
      }).filter(Boolean)
      setImgUrls(absoluteUrls)
      setReviewImages([]) // 기존 이미지가 있으면 새로 추가한 이미지 초기화
    } else {
      setImgUrls([])
    }
  }, [existingImgs])

  // 파일 변경 -> 미리보기 생성
  const handleImageChange = (files) => {
    if (!files || files.length === 0) return

    // 현재 imgUrls 개수를 기준으로 남은 슬롯 계산
    const remainingSlots = Math.max(0, 4 - imgUrls.length)
    const newFiles = Array.from(files).slice(0, remainingSlots)
    
    if (newFiles.length === 0) return

    setReviewImages((prev) => [...prev, ...newFiles])

    const urlPromises = newFiles.map((file) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      return new Promise((resolve) => {
        reader.onload = (data) => resolve(data.target.result)
      })
    })

    Promise.all(urlPromises).then((urls) => {
      // 기존 imgUrls에 새로 선택한 이미지 미리보기 추가
      setImgUrls((prev) => [...prev, ...urls])
    })
  }

  // 이미지 제거
  const handleImageRemove = (index) => {
    // existingImgs의 개수를 기준으로 서버 이미지인지 새로 추가한 이미지인지 확인
    const apiBase = (import.meta.env.VITE_APP_API_URL || '').replace(/\/$/, '')
    const existingAbsoluteUrls = existingImgs.map((url) => {
      if (!url) return ''
      if (url.startsWith('http://') || url.startsWith('https://')) return url
      return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`
    }).filter(Boolean)
    
    // 서버 이미지인 경우 (existingImgs에 포함된 이미지)
    if (index < existingAbsoluteUrls.length) {
      // 서버 이미지는 제거하지 않고, 새로 추가한 이미지만 제거
      // 실제로는 서버 이미지도 제거할 수 있도록 별도 처리 필요
      return
    }
    
    // 새로 추가한 이미지의 인덱스 계산
    const newIndex = index - existingAbsoluteUrls.length
    setReviewImages((prev) => prev.filter((_, i) => i !== newIndex))
    setImgUrls((prev) => prev.filter((_, i) => i !== index))
  }

  // 제출
  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting) return

    // 검증
    if (!itemId) {
      setMessage({ type: 'error', text: '상품 정보가 없습니다.' })
      return
    }
    if (!rating) {
      setMessage({ type: 'error', text: '별점을 선택해 주세요.' })
      return
    }
    if (!reviewContent.trim()) {
      setMessage({ type: 'error', text: '후기 내용을 입력해 주세요.' })
      return
    }

    setSubmitting(true)
    setMessage({ type: '', text: '' })

    const formData = new FormData()
    formData.append('reviewContent', reviewContent.trim())
    formData.append('rating', String(rating))
    formData.append('itemId', String(itemId))
    formData.append('reviewDate', new Date().toISOString())

    // 새로 추가한 이미지만 전송 (서버 저장본은 서버 쪽 정책에 맞게 별도 처리 필요)
    reviewImages.forEach((file) => {
      const encoded = new File([file], encodeURIComponent(file.name), { type: file.type })
      formData.append('img', encoded)
    })

    const run = isEdit
      ? dispatch(updateReviewThunk({ formData, id: reviewId ?? review?.id }))
      : dispatch(createReviewThunk(formData))

    run
      .unwrap()
      .then(() => {
        setMessage({ type: 'success', text: isEdit ? '후기를 수정했습니다.' : '후기를 작성했습니다.' })
        navigate(onSuccess, { replace: true })
      })
      .catch((err) => {
        setMessage({ type: 'error', text: `처리 중 문제가 발생했습니다. ${err}` })
      })
      .finally(() => setSubmitting(false))
  }

  return (
    <section className="container py-5">
          <h1 className="section-title">{isEdit ? '리뷰 수정' : '리뷰 작성'}</h1>

          <SectionCard
          title={`'${itemName}'에 대해 얼마나 만족하시나요?`}
          headerActions={
            <div className="d-flex align-items-center gap-2" aria-label="별점 선택">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  className={`btn btn-link p-0 border-0 ${(hover || rating) >= n ? 'opacity-100' : 'opacity-50'}`}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  aria-label={`${n}점`}
                  style={{ transition: 'opacity 0.2s' }}
                >
                  <Icon 
                    icon={(hover || rating) >= n ? "pixel:star-solid" : "pixel:star"} 
                    width="24" 
                    height="24" 
                    style={{ color: (hover || rating) >= n ? '#ffbf00' : '#fff' }}
                  />
                </button>
              ))}
              <span className="ms-2 small text-white">
                {rating > 0 ? `${rating}/5` : '← 별점을 선택해 주세요'}
              </span>
            </div>
          }
          >
              {/* 상태 메시지 */}
              {message.text && (
                <div className={`alert ${message.type === 'error' ? 'alert-danger' : 'alert-success'} mb-4`} role="alert">
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
              {/* 리뷰 내용 */}
              <div className="mb-4">
                  <Textarea
                    value={reviewContent}
                    onChange={setReviewContent}
                    placeholder="여기에 리뷰를 작성하세요. (최소 1자)"
                    rows={5}
                    className="w-100"
                  />
                </div>

                {/* 이미지 업로드 */}
                <div className="mb-4">
                  <ImageUpload
                    multiple
                    maxFiles={4}
                    previewUrls={imgUrls}
                    onChange={handleImageChange}
                    onRemove={handleImageRemove}
                    buttonText="사진 등록"
                    disabled={submitting}
                  />
                </div>

                {/* 제출 */}
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled={submitting}
                  >
                    {submitting ? (isEdit ? '수정 중...' : '등록 중...') : isEdit ? '수정하기' : '등록하기'}
                  </Button>
                </div>
              </form>
          </SectionCard>
    </section>
  )
}
