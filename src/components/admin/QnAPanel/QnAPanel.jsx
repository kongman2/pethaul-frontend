import { useEffect, useState, useCallback, memo, useMemo } from 'react'
import { Pagination } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Icon } from '@iconify/react'

import { deleteQnaThunk, enterCommentThunk, getQnaThunk } from '../../../features/qnaSlice'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'
import { SectionCard, ConfirmModal, AlertModal } from '../../common'
import FilterForm from '../../common/FilterForm/FilterForm'
import QnATable from '../../qna/QnATable'
import { useConfirmModal } from '../../../hooks/useConfirmModal'
import { useAlertModal } from '../../../hooks/useAlertModal'

function QnAPanel() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { qnaList, pagination } = useSelector((state) => state.qna)
  const [activeQnaId, setActiveQnaId] = useState(null)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all') // all, product, general (tag로 사용)
  const [filterOpen, setFilterOpen] = useState(false)
  
  const confirmModal = useConfirmModal()
  const alertModal = useAlertModal()

  useEffect(() => {
    if (!user?.id || !user?.role) return

    const payload = {
      id: user.id,
      role: user.role,
      page,
      limit: 10,
    }
    dispatch(getQnaThunk(payload))
  }, [dispatch, user?.id, user?.role, page])

  const handlePageChange = (e, value) => {
    setPage(value)
  }

  const handleDelete = useCallback(
    (id) => {
      confirmModal.open({
        title: '삭제 확인',
        message: '정말 삭제하시겠습니까?',
        confirmText: '삭제',
        cancelText: '취소',
        variant: 'danger',
        onConfirm: () => {
          dispatch(deleteQnaThunk(id))
            .unwrap()
            .then(() => {
              alertModal.open({
                title: '완료',
                message: '문의를 삭제했습니다.',
                variant: 'success',
              })
              dispatch(getQnaThunk({ id: user.id, role: user.role, page, limit: 10 }))
            })
            .catch((error) => {
              const status = error?.response?.status
              const data = error?.response?.data
              alertModal.open({
                title: '오류',
                message: `삭제 실패\n${status ? `status: ${status}\n` : ''}${data ? `response: ${JSON.stringify(data)}` : error?.message || ''}`,
                variant: 'danger',
              })
            })
        },
      })
    },
    [dispatch, user?.id, user?.role, page, confirmModal, alertModal]
  )

  const enterComment = useCallback(
    ({ id, comment, onDone }) => {
      if (!comment?.trim()) {
        alertModal.open({
          title: '입력 필요',
          message: '답글 내용을 입력해 주세요.',
          variant: 'warning',
        })
        return
      }

      dispatch(enterCommentThunk({ id, comment }))
        .unwrap()
        .then(() => {
          alertModal.open({
            title: '완료',
            message: '답글 등록이 완료되었습니다.',
            variant: 'success',
          })
          setActiveQnaId(null)
          dispatch(getQnaThunk({ id: user?.id, role: user?.role, page, limit: 10 }))
          onDone?.()
        })
        .catch((error) => {
          alertModal.open({
            title: '오류',
            message: `답글 등록 중 오류가 발생했습니다.${error?.message ? `\n${error.message}` : ''}`,
            variant: 'danger',
          })
        })
    },
    [dispatch, user?.id, user?.role, page, alertModal]
  )

  const filteredList = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return qnaList.filter((q) => {
      // 문의 유형 필터 (상품문의 vs 1:1 문의)
      const matchesType =
        typeFilter === 'all'
          ? true
          : typeFilter === 'product'
          ? Boolean(q?.itemId || q?.Item)
          : !q?.itemId && !q?.Item

      // 답변 상태 필터
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
          ? !q?.comment
          : Boolean(q?.comment)

      if (!matchesType || !matchesStatus) return false
      if (!search) return true

      const haystack = `${q?.title ?? ''} ${q?.User?.name ?? ''} ${q?.id ?? ''} ${q?.Item?.itemNm ?? ''}`.toLowerCase()
      return haystack.includes(search)
    })
  }, [qnaList, searchTerm, statusFilter, typeFilter])

  const handleFilterSearch = (e) => {
    e.preventDefault()
  }

  const handleFilterReset = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all') // tag 필터도 초기화
  }

  return (
    <AdminPanelLayout title="1:1 문의">
      <SectionCard
        title="문의 필터"
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
              { value: 'all', label: '답변 상태 전체' },
              { value: 'pending', label: '답변 대기' },
              { value: 'answered', label: '답변 완료' },
            ]}
            tagOptions={[
              { value: 'all', label: '문의 유형 전체' },
              { value: 'product', label: '상품문의' },
              { value: 'general', label: '1:1 문의' },
            ]}
            values={{ q: searchTerm, status: statusFilter, tag: typeFilter }}
            onChange={{ setQ: setSearchTerm, setStatus: setStatusFilter, setTag: setTypeFilter }}
            onSearch={handleFilterSearch}
            onReset={handleFilterReset}
            showStatus
            showTag
            showSearch
            variant="admin"
          />
        )}
      </SectionCard>

      <div className="row align-items-center gx-3 gy-2 mt-3 mb-4">
        <div className="col-auto">
          <p className="item-count mb-0">문의 {filteredList.length}건</p>
        </div>
        <div className="col-auto">
          <p className="item-count mb-0 text-info">
            상품문의: {qnaList.filter((q) => q?.itemId || q?.Item).length}건
          </p>
        </div>
        <div className="col-auto">
          <p className="item-count mb-0 text-secondary">
            1:1 문의: {qnaList.filter((q) => !q?.itemId && !q?.Item).length}건
          </p>
        </div>
      </div>

      <QnATable
        qnaList={filteredList}
        renderBody={(q) => (
          <>
            <div className="qna-question">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="qna-label">문의 내용</div>
                <div className="d-flex gap-2">
                  {q?.itemId || q?.Item ? (
                    <span className="badge bg-primary">상품문의</span>
                  ) : (
                    <span className="badge bg-secondary">1:1 문의</span>
                  )}
                  {q?.Item && (
                    <span className="badge bg-info">상품: {q.Item.itemNm}</span>
                  )}
                </div>
              </div>
              <p className="qna-content">{q?.content}</p>
            </div>

            <div className="qna-actions">
              {!q?.comment && (
                <button type="button" className="btn" onClick={() => setActiveQnaId((v) => (v === q.id ? null : q.id))}>
                  {activeQnaId === q.id ? '닫기' : '답글 달기'}
                </button>
              )}
              <button type="button" className="btn danger" onClick={() => handleDelete(q.id)}>
                삭제
              </button>
            </div>

            {activeQnaId === q.id && !q?.comment && (
              <CommentBox id={q.id} onSubmit={(comment, done) => enterComment({ id: q.id, comment, onDone: done })} />
            )}

            <div className="qna-reply">
              <div className="qna-reply-title">관리자 답글</div>
              {q?.comment ? <p className="qna-reply-content">{q.comment}</p> : <p className="qna-reply-empty">등록된 답글이 없습니다.</p>}
            </div>
          </>
        )}
      />

      {pagination && (
        <div className="pethaul-pagination mt-3 mb-3 px-3">
          <Pagination>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
              <Pagination.Item key={pageNum} active={pageNum === page} onClick={() => handlePageChange(null, pageNum)}>
                {pageNum}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </AdminPanelLayout>
  )
}

const CommentBox = memo(function CommentBox({ onSubmit }) {
  const [localComment, setLocalComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = () => {
    if (submitting) return
    setSubmitting(true)
    onSubmit(localComment, () => {
      setLocalComment('')
      setSubmitting(false)
    })
  }

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="qna-question">
      <div className="qna-label">답글 달기</div>
      <textarea
        rows={5}
        value={localComment}
        onChange={(e) => setLocalComment(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="관리자 답글을 입력하세요. (Ctrl/Cmd + Enter 제출)"
        className="qna-textarea"
      />
      <div className="qna-actions">
        <button type="button" className="btn primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? '등록 중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
})

export default QnAPanel

