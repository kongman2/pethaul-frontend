import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { fetchContentsThunk } from '../../features/contentSlice'

import { ContentHero, ContentGrid, SkeletonHero, SkeletonGrid } from '../../components/contents'
import { Button, Spinner, PageHeader } from '../../components/common'
import { Icon } from '@iconify/react'
import useAppBackground from '../../hooks/useAppBackground'

export default function ContentsPage() {
  useAppBackground('app-bg--dots')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // 로그인 사용자(관리자 판별)
  const user = useSelector((s) => s.auth?.user)
  const isAdmin = !!user && (user.isAdmin === true || user.role === 'admin' || user.role === 'ADMIN')

  const hero = useSelector((s) => s.content.hero)
  const list = useSelector((s) => s.content.list)
  const page = useSelector((s) => s.content.page)
  const hasMore = useSelector((s) => s.content.hasMore)
  const loading = useSelector((s) => s.content.loading)
  const error = useSelector((s) => s.content.error)

  const [initialLoading, setInitialLoading] = useState(true)
  const [moreLoading, setMoreLoading] = useState(false)

  const tag = searchParams.get('tag') || undefined
  const q = searchParams.get('q') || undefined
  const size = 10

  const load = useCallback(
    async (nextPage = 1) => {
      try {
        if (nextPage === 1) setInitialLoading(true)
        else setMoreLoading(true)

        await dispatch(fetchContentsThunk({ page: nextPage, size, tag, q })).unwrap()
      } catch (e) {
      } finally {
        if (nextPage === 1) setInitialLoading(false)
        else setMoreLoading(false)
      }
    },
    [dispatch, tag, q]
  )

  useEffect(() => {
    load(1)
  }, [load])

  const goDetail = (post) => {
    if (!post) return
    navigate(`/contents/${post.id}`)
  }

  return (
    <section className="container py-5">
      <PageHeader
        title="Contents"
        description="반려동물과 함께하는 다양한 이야기"
        onBack={() => navigate(-1)}
        className="mb-4"
        actions={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={() => navigate('/contents/new')}
              icon={<Icon icon="lucide:plus" width={16} height={16} />}
            >
              콘텐츠 등록
            </Button>
          ) : null
        }
      />

      {/* 에러 상태 */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div>
                {typeof error === 'string' ? error : '콘텐츠를 불러오지 못했습니다.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 로딩 & 콘텐츠 */}
      {initialLoading && !hero ? (
        <>
          <SkeletonHero />
          <SkeletonGrid />
        </>
      ) : (
        <>
          {/* Hero 섹션 */}
          {hero && (
            <div className="row mb-5">
              <div className="col-12">
                <ContentHero post={hero} onClick={goDetail} />
              </div>
            </div>
          )}

          {/* 콘텐츠 그리드 */}
          {list.length > 0 ? (
            <div className="row mb-4">
              <div className="col-12">
                <ContentGrid posts={list} onItemClick={goDetail} />
              </div>
            </div>
          ) : (
            <div className="row">
              <div className="col-12">
                <div className="alert alert-info text-center py-5" role="alert">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-inbox mb-3" viewBox="0 0 16 16">
                    <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm9.954 5H10.45a2.5 2.5 0 0 1-4.9 0H1.066l.32 2.562a.5.5 0 0 0 .497.438h12.234a.5.5 0 0 0 .496-.438L14.933 9zM3.809 3.563A1.5 1.5 0 0 1 4.981 3h6.038a1.5 1.5 0 0 1 1.172.563l3.7 4.625a.5.5 0 0 1 .105.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
                  </svg>
                  <h5 className="mb-2">표시할 콘텐츠가 없습니다</h5>
                  <p className="text-muted mb-0">새로운 콘텐츠가 곧 업로드될 예정입니다.</p>
                </div>
              </div>
            </div>
          )}

          {/* 더보기 버튼 */}
          {hasMore && (
            <div className="row">
              <div className="col-12 d-flex justify-content-center">
                <Button
                  variant="outline"
                  onClick={() => load(page + 1)}
                  disabled={moreLoading || loading}
                  size="lg"
                >
                  {moreLoading ? (
                    <Spinner size="sm" text="" />
                  ) : (
                    '더 보기'
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
