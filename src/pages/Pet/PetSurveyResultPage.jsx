import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { createPet } from '../../api/petApi'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import { extractRecommendationKeyword, extractRecommendationKeywords } from '../../utils/recommendationUtils'

import { Button, AlertModal, ConfirmModal } from '../../components/common'

import './PetSurveyResultPage.scss'

function PetSurveyResultPage() {
   const location = useLocation()
   const navigate = useNavigate()
   const { isAuthenticated } = useSelector((state) => state.auth)
   const { alert, confirm, alertModal, confirmModal } = useModalHelpers()
   const [isSubmitting, setIsSubmitting] = useState(false)

   // 전달받은 데이터
   const { petCharacteristics, imagePreview, petImage, answers, isViewMode } = location.state || {}

   // 데이터가 없으면 메인으로 리다이렉트
   if (!petCharacteristics) {
      navigate('/')
      return null
   }

   const { petTypeInfo } = petCharacteristics

   // 반려동물 등록 (로그인 필요)
   const handleRegisterPet = async () => {
      if (!isAuthenticated) {
         confirm(
            `${answers.petName}의 정보를 저장하려면 로그인이 필요합니다.\n로그인 페이지로 이동하시겠습니까?`,
            () => {
               sessionStorage.setItem('pendingPetSurvey', JSON.stringify(answers))
               navigate('/login', { state: { from: '/mypage' } })
            },
            '로그인 필요',
            '이동',
            '취소',
            'primary'
         )
         return
      }

      try {
         setIsSubmitting(true)

         const formData = new FormData()
         formData.append('petName', answers.petName)
         formData.append('petType', answers.petType)
         formData.append('breed', answers.breed)
         formData.append('gender', answers.gender)
         formData.append('age', answers.age)
         
         // 이미지가 있으면 추가 (백엔드는 'img' 필드명 사용)
         if (petImage) {
            formData.append('img', petImage)
         }

         // 설문조사 결과 데이터 저장
         const surveyData = {
            personality: answers.personality,
            activity: answers.activity,
            sociability: answers.sociability,
            petTypeCode: petTypeInfo.code,
            petTypeTitle: petTypeInfo.title,
            petTypeEmoji: petTypeInfo.emoji,
            description: petTypeInfo.description,
            recommendations: petTypeInfo.recommendations,
            activities: petTypeInfo.activities,
            tags: petCharacteristics.tags
         }
         formData.append('surveyResult', JSON.stringify(surveyData))

         const response = await createPet(formData)

         if (response.data.success) {
            alert(`${answers.petName}가(이) 성공적으로 등록되었습니다.`, '완료', 'success')
            navigate('/mypage')
         }
      } catch (error) {
         let errorMsg = '반려동물 등록에 실패했습니다.'
         
         if (error.response?.data?.message) {
            errorMsg = error.response.data.message
         } else if (error.response?.status === 500) {
            errorMsg = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
         } else if (error.response?.status === 400) {
            errorMsg = '입력 정보를 확인해주세요.'
         } else if (!error.response) {
            errorMsg = '네트워크 연결을 확인해주세요.'
         }
         
         alert(errorMsg, '오류', 'danger')
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <section id="pet-survey-result" className="container py-5">
         <div className="text-center mb-5">
            <div className="result-reveal-animation">
               <div className="result-emoji">{petTypeInfo.emoji}</div>
               <h1 className="result-type-title">{petTypeInfo.title}</h1>
               <div className="result-type-code">{petTypeInfo.code}</div>
            </div>
         </div>

         <div className="row justify-content-center mb-5">
            <div className="col-12 col-md-10 col-lg-8">
               <div className="survey-result-card">
                  {imagePreview && (
                     <div className="result-pet-image mb-4">
                        <img src={imagePreview} alt={petCharacteristics.name} />
                     </div>
                  )}
                  
                  <div className="result-header mb-4 text-center">
                     <h2 className="result-pet-name">{petCharacteristics.name}</h2>
                     <p className="result-pet-info">
                        {petCharacteristics.breed} • {petCharacteristics.gender === 'M' ? '남아 ♂️' : '여아 ♀️'} • {
                           petCharacteristics.ageInMonths 
                              ? `${petCharacteristics.ageInMonths}개월` 
                              : `${petCharacteristics.age}살`
                        }
                     </p>
                  </div>
                  <div className="result-tags mb-4">
                     {petCharacteristics.tags.map((tag, index) => (
                        <span key={index} className="pet-tag">#{tag}</span>
                     ))}
                  </div>
                  <div className="result-type-description mb-4">
                     <h3 className="mb-3">성격 분석</h3>
                     <p className="type-description">{petTypeInfo.description}</p>
                  </div>



                  <div className="result-recommendations mb-4">
                     <h3 className="mb-3">추천 제품</h3>
                     <div className="recommendation-list">
                        {petTypeInfo.recommendations.map((item, index) => {
                           const keyword = extractRecommendationKeyword(item)
                           return (
                              <div 
                                 key={index} 
                                 className="recommendation-item recommendation-item--clickable"
                                 onClick={() => navigate(`/item?searchTerm=${encodeURIComponent(keyword)}`)}
                                 role="button"
                                 tabIndex={0}
                                 onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                       e.preventDefault()
                                       navigate(`/item?searchTerm=${encodeURIComponent(keyword)}`)
                                    }
                                 }}
                              >
                                 <span className="rec-icon">✓</span>
                                 <span>{item}</span>
                              </div>
                           )
                        })}
                     </div>
                     <div className="recommendation-button-wrapper mt-3">
                        <Button
                           variant="primary"
                           size="md"
                           fullWidth
                           onClick={() => {
                              const keywords = extractRecommendationKeywords(petTypeInfo.recommendations)
                              const searchParams = new URLSearchParams()
                              keywords.forEach((keyword) => {
                                 searchParams.append('searchTerm', keyword)
                              })
                              navigate(`/item?${searchParams.toString()}`)
                           }}
                        >
                           추천 상품 모두 보기
                        </Button>
                     </div>
                  </div>

                  <div className="result-activities mb-4">
                     <h3 className="mb-3">추천 활동</h3>
                     <div className="activity-list">
                        {petTypeInfo.activities.map((activity, index) => (
                           <div key={index} className="activity-item">
                              <span className="activity-icon"></span>
                              <span>{activity}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="row g-3 justify-content-center mb-5">
            {/* 조회 모드가 아닐 때만 등록 버튼 표시 */}
            {!isViewMode && (
               <div className="col-12 col-sm-6 col-md-4">
                  <Button
                     variant="primary"
                     size="lg"
                     fullWidth
                     onClick={handleRegisterPet}
                     disabled={isSubmitting}
                  >
                     {isSubmitting ? '등록 중...' : isAuthenticated ? '등록하고 마이페이지로' : '로그인하고 등록하기'}
                  </Button>
               </div>
            )}
            <div className="col-12 col-sm-6 col-md-4">
               <Button
                  variant={isViewMode ? 'primary' : 'outline'}
                  size="lg"
                  fullWidth
                  onClick={() => navigate(isViewMode ? '/mypage' : '/')}
               >
                  {isViewMode ? '마이페이지로 돌아가기' : '메인으로 돌아가기'}
               </Button>
            </div>
            {isViewMode && (
               <div className="col-12 col-sm-6 col-md-4">
                  <Button
                     variant="outline"
                     size="lg"
                     fullWidth
                     onClick={() => navigate('/', { state: { scrollToSurvey: true } })}
                  >
                     다시 설문조사 하기
                  </Button>
               </div>
            )}
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
      </section>
   )
}

export default PetSurveyResultPage

