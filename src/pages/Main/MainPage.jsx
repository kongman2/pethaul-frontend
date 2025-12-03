import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'

import { fetchItemsThunk, fetchSortDataThunk } from '../../features/itemSlice'
import { fetchContentsThunk as fetchPostsThunk } from '../../features/contentSlice'
import { fetchNewReviewsThunk, selectReviewList } from '../../features/reviewSlice'

import {
   BannerSection,
   BestProductsSection,
   ContentsReviewSection,
   NewItemsSection,
   PetSurveySection,
   SeasonPromotionSection,
} from '../../components/main'
import { createSelector } from '@reduxjs/toolkit'

import { buildImageUrl, getContentImageUrl } from '../../utils/imageUtils'
import { getPopularKeywords } from '../../api/itemApi'

import { Spinner } from '../../components/common'

import './Main.scss'

function MainPage() {
   const dispatch = useDispatch()
   const fetchedRef = useRef(false)
   const navigate = useNavigate()
   const location = useLocation()
   const surveySectionRef = useRef(null)

   // 로컬 상태로 요청 진행/에러 관리
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState(null)
   const [keywords, setKeywords] = useState([])
   const [seasonItems, setSeasonItems] = useState([])

   //  메인 데이터만 구독 (list/검색 상태, 전역 loading 변화에 영향 안 받음)
   // shallowEqual로 불필요한 리렌더링 방지
   const mainData = useSelector((s) => s.item.main, shallowEqual)

   const { topSales, topToday, newItems } = useMemo(
      () => ({
         topSales: mainData?.topSales ?? [],
         topToday: mainData?.topToday ?? [],
         newItems: mainData?.newItems ?? [],
      }),
      [mainData]
   )
   // NEW CONTENTS용 - published 상태만 필터링하고 모두 프로모션 형식으로 변환
   // shallowEqual로 불필요한 리렌더링 방지
   const allPosts = useSelector((s) => s.content?.posts ?? [], shallowEqual)
   const contentPromotions = useMemo(
      () => allPosts
         .filter(post => post.status === 'published') // 공개된 콘텐츠만
         .sort((a, b) => {
            // isFeatured=true인 콘텐츠를 먼저 표시
            if (a.isFeatured && !b.isFeatured) return -1
            if (!a.isFeatured && b.isFeatured) return 1
            return 0
         })
         .map(post => ({
            id: post.id,
            image: getContentImageUrl(post.coverUrl, post.thumbUrl),
            eyebrow: post.tag || 'PROMOTION',
            title: post.title,
            description: post.summary,
            ctaLabel: '자세히 보기',
            ctaHref: `/contents/${post.id}`,
         })),
      [allPosts]
   )

   // REVIEWS용 (둘 중 하나 택1)
   const reviews = useSelector(selectReviewList, shallowEqual)

   useEffect(() => {
      if (fetchedRef.current) return
      fetchedRef.current = true
      
      const timeoutId = setTimeout(() => {
         setError('데이터 로딩 시간이 초과되었습니다. 서버 연결을 확인하세요.')
         setLoading(false)
      }, 30000)
      
      // 점진적 로딩: 중요한 데이터 먼저, 나머지는 백그라운드에서
      ;(async () => {
         try {
            // 1단계: 핵심 데이터 먼저 로드 (사용자가 즉시 볼 수 있는 콘텐츠)
            const criticalResults = await Promise.allSettled([
               dispatch(fetchSortDataThunk(5)),
               dispatch(fetchItemsThunk({ sellCategory: ['강아지/장마'] })),
            ])
            
            // 시즌 상품 별도 로드
            dispatch(fetchItemsThunk({ sellCategory: ['시즌'], page: 1, limit: 4 }))
               .unwrap()
               .then((result) => {
                  const items = Array.isArray(result) ? result : result?.items ?? []
                  setSeasonItems(items.slice(0, 4))
               })
               .catch(() => {
                  setSeasonItems([])
               })
            
            // 핵심 데이터 로드 완료 후 즉시 UI 표시
            setLoading(false)
            clearTimeout(timeoutId)
            
            // 2단계: 부가 데이터는 백그라운드에서 로드 (UI 블로킹 없음)
            Promise.allSettled([
               dispatch(fetchPostsThunk()),
               dispatch(fetchNewReviewsThunk({ page: 1, size: 6 })),
            ]).catch(() => {})
            
            getPopularKeywords(4).then((kw) => {
               setKeywords(kw)
            }).catch(() => {})
            
            const failed = criticalResults.filter((r) => r.status === 'rejected')
            if (failed.length > 0) {
               if (criticalResults[0].status === 'rejected') {
                  const errorMsg = failed[0].reason?.message || '메인 데이터를 불러오지 못했습니다.'
                  setError(errorMsg)
               }
            }
         } catch (e) {
            clearTimeout(timeoutId)
            setError(e?.message || '데이터를 불러오지 못했습니다.')
            setLoading(false)
         }
      })()
      
      return () => {
         clearTimeout(timeoutId)
      }
   }, [dispatch])

   // 설문조사 섹션으로 스크롤
   useEffect(() => {
      if (location.state?.scrollToSurvey && surveySectionRef.current && !loading) {
         setTimeout(() => {
            surveySectionRef.current?.scrollIntoView({ 
               behavior: 'smooth', 
               block: 'start' 
            })
         }, 100)
         // state 초기화 (뒤로가기 시 다시 스크롤하지 않도록)
         navigate(location.pathname, { replace: true })
      }
   }, [location.state?.scrollToSurvey, loading, navigate, location.pathname])

   // 1) 네트워크 요청 중
   if (loading) {
      return (
         <main>
            <div className="container">
               <Spinner fullPage text="메인 페이지를 불러오는 중..." />
            </div>
         </main>
      )
   }

   // 2) 에러
   if (error) {
      return (
         <main>
            <div className="container">
               <p>오류: {String(error)}</p>
               <button onClick={() => window.location.reload()}>새로고침</button>
            </div>
         </main>
      )
   }

   // 3) 요청은 끝났지만 비어 있음 (빈 상태 UI)
   // 데이터가 없어도 페이지는 보여주되, 빈 섹션만 표시
   const total = topSales.length + topToday.length + newItems.length
   const hasNoMainData = !mainData || total === 0

   return (
      <main>
         <div className="container">
            <div className="main__top">
               <BannerSection />
               {topToday.length > 0 && (
                <BestProductsSection
                  items={topToday.slice(0, 4)}
                  buildImg={buildImageUrl}
                  titleOverride="오늘의 BEST HAUL"
                  iconOverride="pixel:trending-up"
                  sectionId="best-products-today"
                />
              )}
 
               <div ref={surveySectionRef}>
                  <PetSurveySection />
               </div>
               </div>

            <div className="main__bottom">
               <ContentsReviewSection posts={[]} reviews={reviews} promotions={contentPromotions} keywords={keywords} />

               <SeasonPromotionSection items={seasonItems} buildImg={buildImageUrl} />

               <NewItemsSection items={newItems.slice(0, 4)} buildImg={buildImageUrl} />
               </div>
         </div>
      </main>
   )
}

export default MainPage

