import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

import { fetchContentsThunk, deleteContentThunk } from '../../../features/contentSlice'
import { getContentImageUrl } from '../../../utils/imageUtils'

import FilterForm from '../../common/FilterForm/FilterForm'
import { Button, SectionCard, Spinner, AlertModal, ConfirmModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'


export default function ContentPanel() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { alertModal, confirmModal } = useModalHelpers()

  // 관리자 페이지에서는 hero를 제외하지 않고 모든 콘텐츠를 표시
  const allContent = useSelector((s) => {
    const list = s.content?.list ?? []
    const hero = s.content?.hero
    // hero가 있고 list에 없으면 추가
    if (hero && !list.find((item) => item.id === hero.id)) {
      return [hero, ...list]
    }
    return list
  })
  const rows = allContent
  const page = useSelector((s) => s.content?.page ?? 1)
  const hasMore = useSelector((s) => s.content?.hasMore ?? false)
  const loading = useSelector((s) => s.content?.loading ?? false)
  const error = useSelector((s) => s.content?.error ?? null)

  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [status, setStatus] = useState('all') // all | published | draft
  const [deletingId, setDeletingId] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const size = 20

  const load = (nextPage = 1) => {
    const params = {
      page: nextPage,
      size,
    }
    if (q && q.trim()) params.q = q.trim()
    if (tag && tag.trim()) params.tag = tag.trim()
    if (status && status !== 'all') params.status = status
    
    return dispatch(fetchContentsThunk(params))
      .unwrap()
      .catch((e) => {
      })
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, tag])

  const onSearch = (e) => {
    e.preventDefault()
    load(1)
  }

  const onReset = () => {
    setQ(''); setTag(''); setStatus('all')
    // 상태 바뀌면 useEffect로 1페이지 로드
    load(1)
  }

  const handleDelete = (id, title) => {
    if (!id) return
    confirmModal.open({
      title: '삭제 확인',
      message: `정말로 삭제할까요?\n\n제목: ${title || ''}`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      onConfirm: () => {
        setDeletingId(id)
        dispatch(deleteContentThunk(id))
          .unwrap()
          .then(() => {
            alertModal.open({
              title: '완료',
              message: '삭제되었습니다.',
              variant: 'success',
            })
          })
          .catch((e) => {
            alertModal.open({
              title: '오류',
              message: '삭제에 실패했습니다.',
              variant: 'danger',
            })
          })
          .finally(() => setDeletingId(null))
      },
    })
  }

  return (
    <AdminPanelLayout
      title="콘텐츠 관리"
      actions={
        <Button size="sm" onClick={() => navigate('/contents/new')}>
          새 콘텐츠 등록
        </Button>
      }
    >
      <SectionCard
        title="콘텐츠 필터"
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
            statusOptions={[
              { value: 'all', label: '상태 전체' },
              { value: 'published', label: '발행됨' },
              { value: 'draft', label: '임시저장' },
            ]}
            tagOptions={[
              { value: '', label: '태그 전체' },
              { value: 'GUIDE', label: 'GUIDE' },
              { value: 'TREND', label: 'TREND' },
              { value: 'STORY', label: 'STORY' },
            ]}
            values={{ q, status, tag }}
            onChange={{ setQ, setStatus, setTag }}
            onSearch={onSearch}
            onReset={onReset}
            showStatus
            showTag
            showSearch
            variant="admin"
          />
        )}
      </SectionCard>

      {error && (
        <div className="alert alert-warning" role="alert">
          {typeof error === 'string' ? error : '목록을 불러오는 중 오류가 발생했습니다.'}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3 mb-4 text-muted small">
        <span>콘텐츠 {rows.length}건</span>
      </div>

      <div className="row g-4 flex-grow-1">
        {rows.map((r) => {
          const isDeleting = deletingId === r.id
          return (
            <div className="col-12 col-xl-6" key={r.id}>
              <SectionCard
                className="h-100 section-card--surface"
                showWindowBtn={false}
                bodyClassName="d-flex flex-column gap-3 h-100 p-3"
              >
                <div className="d-flex flex-column gap-3">
                  {r.coverUrl || r.thumbUrl ? (
                    <div className="flex-shrink-0">
                      <img
                        src={getContentImageUrl(r.coverUrl, r.thumbUrl)}
                        alt={r.title}
                        className="img-fluid rounded"
                        style={{ aspectRatio: '1/1', width: '120px', objectFit: 'cover' }}
                      />
                    </div>
                  ) : null}
                  <div className="flex-grow-1">
                    <h3 className="h6 mb-1">{r.title}</h3>
                    <div className="text-muted small">
                      {(r.publishedAt || '').slice(0, 10)} · {r.tag || '-'} · {r.isFeatured ? '배너 노출' : '일반'} · {r.status === 'published' ? '발행됨' : r.status === 'draft' ? '임시저장' : r.status}
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap gap-3 justify-content-end small mt-auto">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => navigate(`/contents/${r.id}`)}
                    disabled={isDeleting}
                  >
                    보기
                  </button>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => navigate(`/admin/contents/${r.id}/edit`)}
                    disabled={isDeleting}
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-danger p-0"
                    onClick={() => handleDelete(r.id, r.title)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              </SectionCard>
            </div>
          )
        })}

        {!rows.length && !loading && (
          <div className="col-12">
            <div className="alert alert-secondary bg-transparent border-0" role="status">
              데이터가 없습니다.
            </div>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-4">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => load(page + 1)}
          >
            {loading ? <Spinner size="sm" text="" /> : '더 보기'}
          </Button>
        </div>
      )}
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

