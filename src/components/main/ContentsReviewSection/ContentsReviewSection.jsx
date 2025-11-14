import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'

import SectionCard from '../../common/SectionCard'
import NewContentsSlider from '../../slider/NewContentsSlider'
import ReviewSlider from '../../slider/ReviewSlider'

import './ContentsReviewSection.scss'

const DEFAULT_KEYWORDS = [1, 2, 3, 4]

function ContentsReviewSection({ posts = [], reviews = [], promotions = [], keywords = [] }) {
   const navigate = useNavigate()
   // reviews가 배열이 아니거나 비어있을 때 처리
   const validReviews = Array.isArray(reviews) ? reviews : []
   // keywords가 없으면 기본값 사용
   const displayKeywords = keywords.length > 0 ? keywords : DEFAULT_KEYWORDS
   
   const handleKeywordClick = (keyword) => {
      if (typeof keyword === 'string') {
         navigate(`/items/search?keyword=${encodeURIComponent(keyword)}`)
      }
   }
   
   return (
      <section className="container py-5 py-lg-6">
         <div className="row g-4">
            <div className="col-12 col-lg-8 d-flex">
               <SectionCard
                  className="flex-grow-1 h-100 overflow-hidden"
                  title="NEW CONTENTS"
                  headerActions={
                     <Link to="/contents" className="section-card__link">
                        보러가기
                        <Icon icon="pixel:angle-right" width={20} height={20} />
                     </Link>
                  }
                  bodyClassName="p-0"
               >
                  <div className="new-contents-card-body">
                     <NewContentsSlider posts={posts} promotions={promotions} />
                  </div>
               </SectionCard>
            </div>

            <div className="col-12 col-lg-4 d-flex flex-column flex-sm-row flex-lg-column gap-4">
               <SectionCard 
                  className="flex-fill flex-lg-grow-1 flex-lg-h-100 overflow-hidden" 
                  title="KEYWORD"
                  bodyClassName="p-0"
               >
                  <div className="keyword-card">
                     {displayKeywords.map((keyword, index) => (
                        <div 
                           key={typeof keyword === 'string' ? keyword : index} 
                           className={`topic ${typeof keyword === 'string' ? 'topic--clickable' : ''}`}
                           onClick={() => handleKeywordClick(keyword)}
                        >
                           <span className="topic__number">{index + 1}.</span>
                           <span className="topic__text">{keyword}</span>
                        </div>
                     ))}
                  </div>
               </SectionCard>

               <SectionCard
                  className="flex-fill flex-lg-grow-1 flex-lg-h-100 overflow-hidden"
                  title="BEST REVIEW"
                  headerActions={
                     <Link to="/reviews" className="section-card__link">
                        <Icon icon="pixel:angle-right" width={20} height={20} />
                     </Link>
                  }
                  bodyClassName="p-0"
               >
                  <div className="review-card flex-grow-1 overflow-hidden">
                     {validReviews.length > 0 ? (
                        <ReviewSlider reviews={validReviews} />
                     ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 p-3 text-muted small">
                           리뷰가 없습니다.
                        </div>
                     )}
                  </div>
               </SectionCard>
            </div>
         </div>
      </section>
   )
}

export default ContentsReviewSection

