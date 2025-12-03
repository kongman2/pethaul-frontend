import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useDispatch, useSelector } from 'react-redux'
import {
  createContentThunk,
  updateContentThunk,
  uploadContentImageThunk,
  selectContentUploading,
  fetchContentByIdThunk,
} from '../../../features/contentSlice'
import { Button, Input, Textarea, Checkbox, Spinner, Selector, ImageUpload, RichTextEditor, AlertModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import './AdminContentForm.scss'

/**
 * props
 * - mode: 'create' | 'edit'
 * - contentId: 수정 시 콘텐츠 ID (mode='edit'일 때 필수)
 * - onCancel: () => void
 * - onSuccess: (saved) => void
 */
export default function AdminContentForm({ mode = 'create', contentId, onCancel, onSuccess }) {
  const dispatch = useDispatch()
  const { alert, alertModal } = useModalHelpers()
  const submitting = useSelector((s) => s.content?.loading) ?? false
  const globalUploading = useSelector(selectContentUploading)
  const currentContent = useSelector((s) => s.content?.current)
  
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const defaults = useMemo(() => ({
    title: '',
    summary: '',
    body: '',
    tag: 'GUIDE',
    coverUrl: '',
    thumbUrl: '',
    isFeatured: false,
    status: 'published',
  }), [])

  const [form, setForm] = useState(defaults)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState({ cover: false })

  // 수정 모드일 때 데이터 fetch
  useEffect(() => {
    if (mode === 'edit' && contentId) {
      setFetchLoading(true)
      setFetchError(null)
      dispatch(fetchContentByIdThunk(contentId))
        .unwrap()
        .then((data) => {
          setForm({ ...defaults, ...data })
        })
        .catch((err) => {
          setFetchError(err?.message || '콘텐츠를 불러오는데 실패했습니다.')
        })
        .finally(() => {
          setFetchLoading(false)
        })
    } else {
      setForm(defaults)
    }
  }, [mode, contentId, dispatch, defaults])

  // currentContent가 변경될 때 폼 업데이트
  useEffect(() => {
    if (mode === 'edit' && currentContent) {
      setForm({ ...defaults, ...currentContent })
    }
  }, [currentContent, mode, defaults])

  // Checkbox onChange 핸들러 제거 (각 필드가 직접 처리)

  const validate = () => {
    const e = {}
    if (!form.title?.trim()) e.title = '제목을 입력하세요.'
    if (!form.summary?.trim()) e.summary = '요약을 입력하세요.'
    if (!form.coverUrl?.trim()) e.coverUrl = '대표 이미지를 등록하세요.'
    // thumbUrl은 선택사항 - Cover 이미지로 대체됨
    return e
  }

  const onSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim(),
      body: form.body,
      tag: form.tag || null,
      coverUrl: form.coverUrl,
      thumbUrl: form.coverUrl, // 대표 이미지와 동일하게 사용
      isFeatured: !!form.isFeatured,
      status: form.status,
    }

    const action = mode === 'create'
      ? createContentThunk(payload)
      : updateContentThunk({ id: contentId, payload })

    dispatch(action)
      .unwrap()
      .then((saved) => onSuccess ? onSuccess(saved) : null)
      .catch(() => alert('저장에 실패했습니다.', '오류', 'danger'))
  }

  const handleUpload = (files) => {
    const file = files?.[0]
    if (!file) return
    setUploading((u) => ({ ...u, cover: true }))
    dispatch(uploadContentImageThunk(file))
      .unwrap()
      .then(({ url }) => {
        // 대표 이미지와 썸네일을 동일하게 설정
        setForm((f) => ({ ...f, coverUrl: url, thumbUrl: url }))
      })
      .catch((err) => {
        console.error('이미지 업로드 실패:', err)
        alert('이미지 업로드 실패', '오류', 'danger')
      })
      .finally(() => setUploading((u) => ({ ...u, cover: false })))
  }

  // 로딩 상태
  if (fetchLoading) {
    return (
      <div className="py-5">
        <Spinner text="콘텐츠를 불러오는 중..." />
      </div>
    )
  }

  // 에러 상태
  if (fetchError) {
    return (
      <div className="alert alert-danger d-flex align-items-center" role="alert">
        <Icon icon="lucide:alert-triangle" width="24" height="24" className="flex-shrink-0 me-2" />
        <div>
          <strong>오류:</strong> {fetchError}
        </div>
      </div>
    )
  }

  return (
    <form className="admin-content-form" onSubmit={onSubmit} noValidate>
      <div className="row g-4">
        {/* 제목 */}
        <div className="col-12">
          <Input
            label="제목"
            id="title"
            name="title"
            value={form.title}
            onChange={(value) => setForm((f) => ({ ...f, title: value }))}
            placeholder="제목을 입력해주세요"
            required
            error={errors.title}
          />
        </div>

        {/* 이미지 업로드 */}
        <div className="col-12">
          <ImageUpload
            label="대표 이미지"
            required
            previewUrls={form.coverUrl ? [form.coverUrl] : []}
            onChange={handleUpload}
            uploading={uploading.cover || globalUploading}
            uploadingText="업로드 중..."
            error={errors.coverUrl}
            hint="콘텐츠의 메인 이미지입니다. 썸네일로도 동일하게 사용됩니다."
            id="cover-image"
            disabled={uploading.cover || globalUploading}
          />
        </div>

        {/* 태그 & 상태 */}
        <div className="col-12 col-md-6">
          <Selector
            label="태그"
            id="tag"
            name="tag"
            value={form.tag}
            onChange={(value) => setForm((f) => ({ ...f, tag: value }))}
            options={[
              { value: 'GUIDE', label: 'GUIDE' },
              { value: 'TREND', label: 'TREND' },
              { value: 'STORY', label: 'STORY' },
            ]}
          />
        </div>
        <div className="col-12 col-md-6">
          <Selector
            label="상태"
            id="status"
            name="status"
            value={form.status}
            onChange={(value) => setForm((f) => ({ ...f, status: value }))}
            options={[
              { value: 'published', label: 'Published (공개)' },
              { value: 'draft', label: 'Draft (임시저장)' },
            ]}
          />
        </div>

        {/* 요약 */}
        <div className="col-12">
          <Textarea
            label="요약"
            id="summary"
            name="summary"
            value={form.summary}
            onChange={(value) => setForm((f) => ({ ...f, summary: value }))}
            rows={3}
            required
            error={errors.summary}
            placeholder="콘텐츠 요약을 입력해주세요"
          />
        </div>

        {/* 본문 */}
        <div className="col-12">
          <RichTextEditor
            label="본문 (선택)"
            id="body"
            value={form.body}
            onChange={(html) => setForm((f) => ({ ...f, body: html }))}
            placeholder="콘텐츠 본문을 입력해주세요. 이미지와 링크를 넣을 수 있어요!"
            onImageUpload={async (file) => {
              // 이미지 업로드 (contentSlice의 uploadContentImageThunk 사용)
              const result = await dispatch(uploadContentImageThunk(file)).unwrap()
              return result.url
            }}
            hint="텍스트 서식, 이미지, 링크를 추가할 수 있습니다."
          />
        </div>
      </div>

      {/* 배너 고정 체크박스 & 액션 버튼 */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-4 mt-4 border-top">
        <Checkbox
          id="isFeatured"
          name="isFeatured"
          label="상단 배너로 고정"
          checked={form.isFeatured}
          onChange={(checked) => setForm((f) => ({ ...f, isFeatured: checked }))}
        />
        <div className="d-flex gap-2">
          <Button variant="outline" onClick={onCancel} type="button">
            취소
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" text="" /> : (mode === 'create' ? '등록' : '수정 저장')}
          </Button>
        </div>
      </div>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </form>
  )
}
