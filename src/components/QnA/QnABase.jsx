import { useEffect } from 'react'
import { useState } from 'react'

import { Input, Textarea, Button, SectionCard, AlertModal } from '../common'
import { useModalHelpers } from '../../hooks/useModalHelpers'

function QnABase({ mode = 'create', initialData, onSubmit }) {
   const { alert, alertModal } = useModalHelpers()
   const [title, setTitle] = useState(initialData?.title ?? '문의 드립니다.')
   const [content, setContent] = useState(initialData?.content ?? '')
   const [submitting, setSubmitting] = useState(false)

   const formMode = initialData
      ? 'edit'
      : String(mode || 'create')
           .trim()
           .toLowerCase()
   const finalSubmitLabel = formMode === 'edit' ? '수정하기' : '등록하기'

   // initialData 변경 시 동기화
   useEffect(() => {
      if (initialData) {
         setTitle(initialData.title ?? '문의 드립니다.')
         setContent(initialData.content ?? '')
      }
   }, [formMode, initialData])

   const handleSubmit = async (e) => {
      e.preventDefault()

      if (!title) return alert('제목을 입력하세요.', '입력 필요', 'warning')
      if (!content) return alert('문의 내용을 입력하세요.', '입력 필요', 'warning')

      const data = { title, content }

      onSubmit(data)
   }

   return (
      <section id="qna-section">
         <h1 className="section-title">1:1 문의</h1>

         <SectionCard title="문의사항을 입력해주세요.">
               <form onSubmit={handleSubmit}>
                  {/* 문의 제목 */}
                  <div className="mb-3">
                     <p className="form-label">제목</p>
                     <Input
                        type="text"
                        value={title}
                        onChange={setTitle}
                        placeholder="제목을 작성하세요."
                        required
                        className="qna-title"
                     />
                  </div>
                  <div className="qna-input-section">
                     <p className="form-label">내용</p>
                     <Textarea
                        value={content}
                        onChange={setContent}
                        placeholder="여기에 문의 내용을 작성하세요. (최소 1자)"
                        rows={5}
                        required
                        className="qna-textarea"
                     />
                  </div>

                  {/* 제출 */}
                  <div className="d-flex justify-content-end mt-3">
                  <Button
                     type="submit"
                     variant="primary"
                     size="lg"
                     disabled={submitting}
                  >
                     {submitting ? (formMode == 'edit' ? '수정 중...' : '등록 중...') : finalSubmitLabel}
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

export default QnABase
