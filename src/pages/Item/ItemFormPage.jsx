import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import { createItemThunk, fetchItemByIdThunk, updateItemThunk, fetchItemsThunk } from '../../features/itemSlice'

import ItemFormBase from '../../components/item/ItemFormBase'
import useAppBackground from '../../hooks/useAppBackground'
import { Spinner, AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'

function ItemFormPage() {
  useAppBackground('app-bg--blue')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { alert, alertModal } = useModalHelpers()

  const { item, loading, error } = useSelector((state) => state.item)

  useEffect(() => {
    if (isEdit) {
      dispatch(fetchItemByIdThunk(id))
    }
  }, [dispatch, isEdit, id])

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await dispatch(updateItemThunk({ id, formData })).unwrap()
        alert('수정이 완료되었습니다.', '완료', 'success')
      } else {
        await dispatch(createItemThunk(formData)).unwrap()
        alert('상품이 등록되었습니다.', '완료', 'success')
        // 상품 등록 후 어드민 페이지 상품관리 목록 새로고침
        await dispatch(fetchItemsThunk({ page: 1, limit: 100 }))
      }
      navigate('/admin')
    } catch (err) {
      throw err
    }
  }

  // 수정 모드일 때 로딩/에러 상태 처리
  if (isEdit) {
    if (loading) {
      return (
        <section className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <Spinner text="상품 정보를 불러오는 중..." />
            </div>
          </div>
        </section>
      )
    }

    if (error) {
      return (
        <section className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                  <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
                </svg>
                <div>
                  <strong>에러 발생:</strong> {String(error)}
                </div>
              </div>
            </div>
          </div>
        </section>
      )
    }

    if (!item) {
      return (
        <section className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="alert alert-warning text-center py-5" role="alert">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-inbox mb-3" viewBox="0 0 16 16">
                  <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
                </svg>
                <h5 className="mb-2">상품이 존재하지 않습니다</h5>
                <p className="text-muted mb-0">올바른 상품 ID를 확인해주세요.</p>
              </div>
            </div>
          </div>
        </section>
      )
    }
  }

  return (
    <>
      <ItemFormBase
        mode={isEdit ? 'edit' : 'create'}
        initialData={isEdit ? item : null}
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
    </>
  )
}

export default ItemFormPage
