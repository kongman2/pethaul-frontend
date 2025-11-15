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
              <Icon icon="lucide:alert-triangle" width={24} height={24} className="me-2" />
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
                <div className="alert text-center py-5" role="alert">
                  <Icon icon="lucide:inbox" width={48} height={48} className="mb-3" />
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
