import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { createQnaThunk, editQnaThunk, getQnaDetailThunk } from '../../features/qnaSlice'

import QnABase from '../../components/Qna/QnABase'
import { AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'

function QnAFormPage({ mode }) {
  useAppBackground('app-bg--gradient')
  const { alert, alertModal } = useModalHelpers()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id: paramsId } = useParams()
  const [searchParams] = useSearchParams()

  const inferredMode = useMemo(() => {
    if (mode) return mode
    const pathMode = searchParams.get('mode')
    if (pathMode === 'edit' || pathMode === 'create') return pathMode
    return paramsId ? 'edit' : 'create'
  }, [mode, paramsId, searchParams])

  const isEdit = inferredMode === 'edit'
  const qnaId = paramsId || searchParams.get('id')

  const { qna, loading: qnaLoading } = useSelector((state) => state.qna)

  useEffect(() => {
    if (isEdit && qnaId) {
      dispatch(getQnaDetailThunk(qnaId))
    }
  }, [dispatch, isEdit, qnaId])

  const handleSubmit = async (data) => {
    try {
      if (isEdit) {
        await dispatch(editQnaThunk({ id: qnaId, data })).unwrap()
        alert('문의 수정이 완료되었습니다.', '완료', 'success')
      } else {
        await dispatch(createQnaThunk(data)).unwrap()
        alert('문의 등록이 완료되었습니다.', '완료', 'success')
      }
      navigate('/myQnAlist')
    } catch (err) {
      const status = err?.response?.status
      const response = err?.response?.data
      alert(
        `${isEdit ? '수정' : '등록'} 실패\n` +
          `${status ? `status: ${status}\n` : ''}` +
          `${response ? `response: ${JSON.stringify(response)}` : err?.message || ''}`,
        '오류',
        'danger'
      )
    }
  }

  return (
    <section className="container py-5">
        <QnABase
          mode={isEdit ? 'edit' : 'create'}
          initialData={isEdit ? qna : undefined}
          loading={isEdit && qnaLoading}
          onSubmit={handleSubmit}
        />
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

export default QnAFormPage


