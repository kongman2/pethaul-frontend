import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getPetProfileImage, buildImageUrl } from '../../../utils/imageUtils'

import { Button } from '../../common'

import './PetProfileCard.scss'

const PetProfile = ({ pet = {} }) => {
  const navigate = useNavigate()
  const base = useMemo(() => import.meta.env.VITE_APP_API_URL || '', [])
  const repImg = (() => {
    const img = pet.images?.find((i) => i.isPrimary)?.imgUrl || pet.images?.[0]?.imgUrl || getPetProfileImage()
    if (!img || img === getPetProfileImage()) return getPetProfileImage()
    return buildImageUrl(img)
  })()

  const genderLabel = (g) => (g === 'M' ? '남' : g === 'F' ? '여' : '-')

  // 설문조사 결과가 있는지 확인
  const hasSurveyResult = pet.surveyResult && typeof pet.surveyResult === 'object' && Object.keys(pet.surveyResult).length > 0

  // 설문결과 다시 보기
  const handleViewSurveyResult = () => {
    const surveyData = typeof pet.surveyResult === 'string' ? JSON.parse(pet.surveyResult) : pet.surveyResult
    
    // PetSurveyResultPage에 필요한 데이터 구조로 변환
    const petCharacteristics = {
      name: pet.petName,
      type: pet.petType,
      breed: pet.breed,
      gender: pet.gender,
      age: pet.age,
      tags: surveyData.tags || [],
      petTypeInfo: {
        code: surveyData.petTypeCode,
        title: surveyData.petTypeTitle,
        emoji: surveyData.petTypeEmoji,
        description: surveyData.description,
        recommendations: surveyData.recommendations || [],
        activities: surveyData.activities || []
      }
    }

    // 이미지 URL 생성
    const imagePreview = repImg !== getPetProfileImage() ? repImg : null

    navigate('/pet-survey-result', {
      state: {
        petCharacteristics,
        imagePreview,
        petImage: null,
        answers: {
          petName: pet.petName,
          petType: pet.petType,
          breed: pet.breed,
          gender: pet.gender,
          age: pet.age,
          personality: surveyData.personality,
          activity: surveyData.activity,
          sociability: surveyData.sociability
        },
        isViewMode: true // 조회 모드임을 표시
      }
    })
  }

  // 설문조사 하러가기
  const handleGoToSurvey = () => {
    navigate('/', { state: { scrollToSurvey: true } })
  }

  return (
    <article className="my-pet-card card border-0 shadow-sm overflow-hidden">
      <div className="row g-0 align-items-center">
        <div className="col-12 col-md-5">
          <div className="petprofile-change text-center p-4 p-md-5 d-flex flex-column align-items-center justify-content-center gap-3 h-100">
            <img src={repImg} alt={pet.petName || '반려동물'} loading="lazy" />
            <Link to="/peteditpage" state={{ pet }} className="petprofile-change__edit">
              프로필 수정
            </Link>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="petprofile-info p-4 p-md-5 d-flex flex-column justify-content-center gap-3 h-100">
            <h2 className="petprofile-info__name mb-0">{pet.petName || '-'}</h2>
            <ul className="petprofile-info__meta list-unstyled mb-0">
              <li>
                {pet.petType ?? '-'}/{pet.breed ?? '-'}
              </li>
              <li>
                나이: {pet.ageInMonths ? `${pet.ageInMonths}개월` : pet.age !== undefined ? `${pet.age}살` : '-'}
              </li>
              <li>성별: {genderLabel(pet.gender)}</li>
            </ul>

            {/* 설문조사 관련 버튼 */}
            <div className="petprofile-survey-action mt-3">
              {hasSurveyResult ? (
                <Button 
                  variant="primary" 
                  size="sm" 
                  fullWidth
                  onClick={handleViewSurveyResult}
                  className="petprofile-survey-btn"
                >
                  📊 설문결과 다시 보기
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth
                  onClick={handleGoToSurvey}
                  className="petprofile-survey-btn"
                >
                  설문조사 하러가기
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default PetProfile
