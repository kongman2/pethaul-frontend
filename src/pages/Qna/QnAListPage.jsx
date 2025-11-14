import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Pagination } from 'react-bootstrap'

import { deleteQnaThunk, getQnaThunk } from '../../features/qnaSlice'

import { Button, Spinner, PageHeader, AlertModal, ConfirmModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import QnATable from '../../components/qna/QnATable'
import useAppBackground from '../../hooks/useAppBackground'
import './QnAListPage.scss'

function QnAListPage() {
   useAppBackground('app-bg--gradient')
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const userId = useSelector((state) => state.auth.user?.id)
   const userRole = useSelector((state) => state.auth.user?.role)
   const { qnaList, pagination, loading, error } = useSelector((state) => state.qna)
   const { alertModal, confirmModal } = useModalHelpers()
   const [page, setPage] = useState(1)
   const fetchedRef = useRef('')

   useEffect(() => {
      if (!userId || !userRole) return
      
      // 중복 호출 방지
      const key = `${userId}-${userRole}-${page}`
      if (fetchedRef.current === key) return
      
      fetchedRef.current = key
      
      const data = {
         id: userId,
         role: userRole,
         page,
         limit: 10,
      }
      dispatch(getQnaThunk(data))
   }, [userId, userRole, page, dispatch])

   const handlePageChange = (e, value) => {
      setPage(value)
   }

   const handleDelete = (id) => {
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
                  fetchedRef.current = '' // ref 초기화하여 재호출 가능하게
                  dispatch(
                     getQnaThunk({
                        id: userId,
                        role: userRole,
                        page,
                        limit: 10,
                     })
                  )
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
   }

   if (loading) return <Spinner fullPage text="문의 목록을 불러오는 중..." />
   if (error) return <p>에러 발생: {error}</p>
   if (!userId) {
    return (
      <section className="container py-5 text-center d-flex flex-column gap-3 align-items-center">
        <p className="mb-3">1:1 문의 내역은 로그인 후에 확인할 수 있습니다.</p>
        <Button variant="primary" onClick={() => navigate('/login')}>
          로그인하러 가기
        </Button>
      </section>
    )
  }

   return (
      <section className="container py-5">
        <PageHeader title="1:1문의" onBack={() => navigate(-1)} className="mb-4" />

        <QnATable
          qnaList={qnaList}
          renderBody={(q) => (
            <>
              <div className="qna-question">
                <div className="qna-label">문의 내용</div>
                <p className="qna-content">{q?.content}</p>
              </div>

              <div className="qna-actions">
                <button type="button" className="btn" onClick={() => navigate(`/qna/edit/${q.id}`)}>
                  수정
                </button>
                <button type="button" className="btn danger" onClick={() => handleDelete(q.id)}>
                  삭제
                </button>
              </div>

              <div className="qna-reply">
                <div className="qna-reply-title">관리자 답글</div>
                {q?.comment ? <p className="qna-reply-content">{q.comment}</p> : <p className="qna-reply-empty">등록된 답글이 없습니다.</p>}
              </div>
            </>
          )}
        />

        <div className="qna-footer">
          <Button variant="primary" onClick={() => navigate('/qna')}>
            새로 문의하기
          </Button>
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

        {pagination && (
          <div className="pethaul-pagination mt-3 mb-3">
            <Pagination>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Pagination.Item key={pageNum} active={pageNum === page} onClick={() => handlePageChange(null, pageNum)}>
                  {pageNum}
                </Pagination.Item>
              ))}
            </Pagination>
          </div>
        )}
      </section>
   )
}

export default QnAListPage
