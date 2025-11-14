import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

import { fetchContentByIdThunk } from '../../features/contentSlice'

import { Button, Spinner, SectionCard, PageHeader } from '../../components/common'
import useAppBackground from '../../hooks/useAppBackground'
import './ContentDetailPage.scss'

export default function ContentDetailPage() {
  useAppBackground('app-bg--blue')
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { current, loading, error } = useSelector((s) => s.content)

  useEffect(() => {
    if (id) {
      dispatch(fetchContentByIdThunk(id))
        .unwrap()
        .catch(() => { /* slice.error로 처리됨 */ })
    }
  }, [dispatch, id])

  // 로딩 상태
  if (loading && !current) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <Spinner text="콘텐츠를 불러오는 중..." />
          </div>
        </div>
      </section>
    )
  }

  // 에러 상태
  if (error && !current) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <Icon icon="bi:exclamation-triangle-fill" width="24" height="24" className="me-2" />
              <div>
                <strong>오류:</strong> {String(error)}
              </div>
            </div>
            <div className="d-flex justify-content-center">
              <Button variant="outline" onClick={() => navigate('/contents')}>
                목록으로
              </Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!current) return null

  return (
    <section className="container py-5 content-detail-page">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          {/* 콘텐츠 카드 */}
          <SectionCard 
            title="콘텐츠 상세 내용"
            className="mb-4"
            bodyClassName="p-4"
          >
            <PageHeader
              title={current.title}
              onBack={() => navigate(-1)}
              className="mb-4"
              headingLevel="h1"
            />

            {/* 메타 정보 */}
            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-4">
              {current.tag && (
                <span className="badge bg-primary">{current.tag}</span>
              )}
              {current.author && (
                <span className="d-flex align-items-center">
                  <Icon icon="bi:person-fill" width="16" height="16" className="me-1" />
                  PetHaul Team
                </span>
              )}
              {current.publishedAt && (
                <span className="d-flex align-items-center">
                  <Icon icon="bi:calendar3" width="16" height="16" className="me-1" />
                  {current.publishedAt.slice(0, 10)}
                </span>
              )}
            </div>

            {/* 커버 이미지 */}
            {current.coverUrl && (
              <div className="mb-4">
                <img 
                  src={current.coverUrl} 
                  alt={current.title} 
                  className="img-fluid rounded shadow-sm w-100"
                />
              </div>
            )}

            {/* 본문 */}
            <div className="content-body">
              {current.summary && (
                <p className="lead text-muted mb-4">{current.summary}</p>
              )}
              {current.body && (
                <div
                  className="content-text"
                  dangerouslySetInnerHTML={{ __html: current.body }}
                />
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="d-flex gap-2 mt-4 pt-4 border-top">
              <Button 
                variant="outline" 
                onClick={() => navigate('/contents')}
                icon={<Icon icon="bi:arrow-left" width="16" height="16" />}
              >
                목록으로
              </Button>
            </div>
          </SectionCard>
        </div>
      </div>
    </section>
  )
}
