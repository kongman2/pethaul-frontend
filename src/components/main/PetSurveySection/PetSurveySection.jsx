import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Button, AlertModal } from '../../common'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import SurveyHeader from './components/SurveyHeader/SurveyHeader'
import SurveyProgress from './components/SurveyProgress/SurveyProgress'
import PetTypeOptions from './components/PetTypeOptions/PetTypeOptions'
import SurveyOptions from './components/SurveyOptions/SurveyOptions'
import SurveyInputForm from './components/SurveyInputForm/SurveyInputForm'
import SurveyImageStep from './components/SurveyImageStep/SurveyImageStep'
import AnalyzingView from './components/AnalyzingView/AnalyzingView'
import { BREED_OPTIONS, BASE_SURVEY_QUESTIONS } from './constants'
import { analyzePetCharacteristics } from './utils'
import './PetSurveySection.scss'

function PetSurveySection() {
   const navigate = useNavigate()
   const { alert, alertModal } = useModalHelpers()
   const [currentStep, setCurrentStep] = useState(0)
   const [answers, setAnswers] = useState({})
   const [inputValue, setInputValue] = useState('')
   const [showResult, setShowResult] = useState(false)
   const [showBreedInput, setShowBreedInput] = useState(false)
   const [showAgeInput, setShowAgeInput] = useState(false)
   const [ageRange, setAgeRange] = useState('')
   const [petImage, setPetImage] = useState(null)
   const [imagePreview, setImagePreview] = useState(null)

   // 선택된 반려동물 종류에 따라 품종 질문 동적 생성
   const SURVEY_QUESTIONS = useMemo(() => {
      const questions = [...BASE_SURVEY_QUESTIONS]
      
      // 품종 질문을 4번 인덱스(나이 다음)에 삽입
      const petType = answers.petType
      if (petType && BREED_OPTIONS[petType]) {
         const breedOptions = BREED_OPTIONS[petType].map(breed => ({
            label: breed,
            value: breed
         }))
         // "기타 품종" 옵션 추가
         breedOptions.push({ label: '기타 품종 (직접입력)', value: 'OTHER' })
         
         questions.splice(4, 0, {
            id: 5,
            question: '품종을 알려주세요',
            type: 'breed',
            options: breedOptions
         })
      }
      
      return questions
   }, [answers.petType])

   const currentQuestion = SURVEY_QUESTIONS[currentStep]
   const progress = ((currentStep + 1) / SURVEY_QUESTIONS.length) * 100
   const totalSteps = SURVEY_QUESTIONS.length
   const showInputForm = (currentQuestion.inputType || showBreedInput || showAgeInput) && !currentQuestion.fileUpload

   const inputPlaceholder = (() => {
      if (showBreedInput) {
         return '예: 믹스견, 스핑크스 등'
      }

      if (showAgeInput) {
         if (ageRange === 'under_1') return '개월 수를 입력하세요 (1~11)'
         if (ageRange === '1_to_11') return '나이를 입력하세요 (1~11살)'
         if (ageRange === 'over_12') return '나이를 입력하세요 (12살 이상)'
      }

      return currentQuestion.placeholder
   })()

   const inputType = showAgeInput ? 'number' : currentQuestion.inputType || 'text'
   const isSubmitDisabled = !inputValue.trim()

   // 답변 선택 핸들러
   const handleOptionSelect = (type, value) => {
      // 품종에서 "기타" 선택 시 입력 필드 표시
      if (type === 'breed' && value === 'OTHER') {
         setShowBreedInput(true)
         return
      }

      // 나이 범위 선택 시 입력 필드 표시
      if (type === 'age') {
         setAgeRange(value)
         setShowAgeInput(true)
         return
      }

      const newAnswers = { ...answers, [type]: value }
      setAnswers(newAnswers)
      setShowBreedInput(false)

      // 자동으로 다음 단계로
      setTimeout(() => {
         if (currentStep < SURVEY_QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1)
         } else {
            handleSurveyComplete(newAnswers)
         }
      }, 300)
   }

   // 텍스트 입력 핸들러
   const handleInputSubmit = (e) => {
      e.preventDefault()
      if (!inputValue.trim()) return

      // 나이 입력 유효성 검사
      if (currentQuestion.type === 'age' && showAgeInput) {
         const ageValue = parseInt(inputValue)
         
         if (isNaN(ageValue) || ageValue < 0) {
            alert('올바른 숫자를 입력해주세요.', '입력 필요', 'warning')
            return
         }

         if (ageRange === 'under_1') {
            if (ageValue < 1 || ageValue > 11) {
               alert('1~11 개월 사이의 값을 입력해주세요.', '입력 필요', 'warning')
               return
            }
            // 1살 미만은 age를 0으로 저장하고 ageInMonths만 사용
            const newAnswers = { 
               ...answers, 
               age: 0, // 1살 미만은 0으로 저장
               ageInMonths: ageValue // 개월 수를 저장
            }
            setAnswers(newAnswers)
            setInputValue('')
            setShowAgeInput(false)
            setAgeRange('')
            
            setTimeout(() => {
               if (currentStep < SURVEY_QUESTIONS.length - 1) {
                  setCurrentStep(currentStep + 1)
               } else {
                  handleSurveyComplete(newAnswers)
               }
            }, 300)
            return
         } else if (ageRange === '1_to_11') {
            if (ageValue < 1 || ageValue > 11) {
               alert('1~11살 사이의 값을 입력해주세요.', '입력 필요', 'warning')
               return
            }
         } else if (ageRange === 'over_12') {
            if (ageValue < 12) {
               alert('12살 이상의 값을 입력해주세요.', '입력 필요', 'warning')
               return
            }
         }

         const newAnswers = { ...answers, age: ageValue }
         setAnswers(newAnswers)
         setInputValue('')
         setShowAgeInput(false)
         setAgeRange('')

         setTimeout(() => {
            if (currentStep < SURVEY_QUESTIONS.length - 1) {
               setCurrentStep(currentStep + 1)
            } else {
               handleSurveyComplete(newAnswers)
            }
         }, 300)
         return
      }

      const newAnswers = { ...answers, [currentQuestion.type]: inputValue }
      setAnswers(newAnswers)
      setInputValue('')
      setShowBreedInput(false)

      if (currentStep < SURVEY_QUESTIONS.length - 1) {
         setCurrentStep(currentStep + 1)
      } else {
         handleSurveyComplete(newAnswers)
      }
   }

   // 이전 단계로
   const handlePrevious = () => {
      if (currentStep > 0) {
         setCurrentStep(currentStep - 1)
         setShowBreedInput(false)
         setShowAgeInput(false)
         setAgeRange('')
      }
   }

   // 이미지 파일 선택 핸들러 (ImageUpload 컴포넌트용)
   const handleImageChange = (files) => {
      const file = files[0]
      if (file) {
         // 파일 크기 검증 (5MB 제한)
         if (file.size > 5 * 1024 * 1024) {
            alert('이미지 크기는 5MB 이하여야 합니다.', '입력 필요', 'warning')
            return
         }

         setPetImage(file)
         
         // 미리보기 생성
         const reader = new FileReader()
         reader.onloadend = () => {
            setImagePreview(reader.result)
         }
         reader.readAsDataURL(file)
      }
   }

   // 이미지 삭제 핸들러
   const handleImageRemove = (index) => {
      setPetImage(null)
      setImagePreview(null)
   }

   // 이미지 단계 완료 (선택사항)
   const handleImageStepComplete = () => {
      const newAnswers = { ...answers, petImage: petImage }
      setAnswers(newAnswers)
      handleSurveyComplete(newAnswers)
   }

   // 이미지 스킵
   const handleSkipImage = () => {
      handleSurveyComplete(answers)
   }

   const handleBreedCancel = () => {
      setShowBreedInput(false)
      setInputValue('')
   }

   const handleAgeCancel = () => {
      setShowAgeInput(false)
      setAgeRange('')
      setInputValue('')
   }

   // 설문 완료 처리 (분석 중 애니메이션 후 결과 페이지로 이동)
   const handleSurveyComplete = (finalAnswers) => {
      // 분석 중 표시
      setShowResult(true)
      
      // 2초 후 결과 페이지로 이동
      setTimeout(() => {
         const characteristics = analyzePetCharacteristics(finalAnswers)
         navigate('/pet-survey-result', { 
            state: { 
               petCharacteristics: characteristics,
               imagePreview: imagePreview,
               petImage: petImage,
               answers: finalAnswers
            } 
         })
      }, 2000)
   }

   if (showResult) {
      return <AnalyzingView petName={answers.petName ?? '반려동물'} />
   }

   return (
      <section className="container py-5 text-center">
         <SurveyHeader question={currentQuestion.question} currentStep={currentStep} totalSteps={totalSteps} />
         <SurveyProgress progress={progress} />

         {currentQuestion.options && currentQuestion.type === 'petType' && (
            <PetTypeOptions
               options={currentQuestion.options}
               selectedValue={answers[currentQuestion.type]}
               onSelect={(value) => handleOptionSelect(currentQuestion.type, value)}
            />
         )}

         {currentQuestion.options && currentQuestion.type !== 'petType' && (
            <SurveyOptions
               options={currentQuestion.options}
               selectedValue={answers[currentQuestion.type]}
               onSelect={(value) => handleOptionSelect(currentQuestion.type, value)}
               questionType={currentQuestion.type}
            />
         )}

         {showInputForm && (
            <SurveyInputForm
               value={inputValue}
               onChange={setInputValue}
               onSubmit={handleInputSubmit}
               placeholder={inputPlaceholder}
               inputType={inputType}
               showBreedCancel={showBreedInput}
               onBreedCancel={handleBreedCancel}
               showAgeCancel={showAgeInput}
               onAgeCancel={handleAgeCancel}
               isSubmitDisabled={isSubmitDisabled}
            />
         )}

         {currentQuestion.fileUpload && (
            <SurveyImageStep
               imagePreview={imagePreview}
               onChange={handleImageChange}
               onRemove={handleImageRemove}
               onSkip={handleSkipImage}
               onComplete={handleImageStepComplete}
               hasImage={Boolean(petImage)}
            />
         )}

         {currentStep > 0 && (
            <div className="row justify-content-center">
               <div className="col-12 col-md-8 col-lg-6">
                  <Button variant="ghost" onClick={handlePrevious}>
                     ← 이전
                  </Button>
               </div>
            </div>
         )}
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

export default PetSurveySection
