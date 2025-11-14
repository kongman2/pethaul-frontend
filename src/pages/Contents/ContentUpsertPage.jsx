import { useNavigate, useParams } from 'react-router-dom'

import AdminContentForm from '../../components/contents/AdminContentForm/AdminContentForm'
import { SectionCard, PageHeader } from '../../components/common'
import useAppBackground from '../../hooks/useAppBackground'

export default function ContentUpsertPage() {
  useAppBackground('app-bg--blue')
  const { id } = useParams()
  const mode = id ? 'edit' : 'create'
  const navigate = useNavigate()

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <PageHeader
            title={mode === 'create' ? '새 콘텐츠 등록' : '콘텐츠 수정'}
            onBack={() => navigate(-1)}
            className="mb-3"
          />

          {/* 콘텐츠 카드 */}
          <SectionCard title="콘텐츠 정보" bodyClassName="p-4">
            <AdminContentForm
              mode={mode}
              contentId={id}
              onCancel={() => navigate(-1)}
              onSuccess={() => navigate('/contents')}
            />
          </SectionCard>
        </div>
      </div>
    </section>
  )
}
