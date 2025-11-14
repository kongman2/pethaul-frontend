import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { createPetThunk, getUserPetsThunk, updatePetThunk } from '../../features/petSlice'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'

import {
  SectionCard,
  Input,
  Button,
  Selector,
  PetProfileSuccessModal,
  ImageUpload,
  PageHeader,
  AlertModal,
} from '../../components/common'

import './PetFormPage.scss'

const MAX_FILES = 10
const API_BASE_URL = (import.meta.env.VITE_APP_API_URL || '').replace(/\/+$/, '')

// 반려동물 종류별 인기 품종
const BREED_OPTIONS = {
   '강아지': [
      '포메라니안', '말티즈', '푸들', '웰시코기', '진돗개', 
      '비숑', '치와와', '닥스훈트', '리트리버', '시츄'
   ],
   '고양이': [
      '코리안숏헤어', '페르시안', '러시안블루', '스코티시폴드', '브리티시숏헤어',
      '아메리칸숏헤어', '렉돌', '뱅갈', '샴', '아비시니안'
   ],
   '햄스터': [
      '골든햄스터', '드워프햄스터', '로보로브스키햄스터', '캠벨햄스터'
   ],
   '토끼': [
      '네덜란드드워프', '미니렉스', '라이온헤드', '롭이어', '앙고라'
   ],
   '새(앵무새)': [
      '왕관앵무', '모란앵무', '사랑앵무', '코뉴어', '아마존앵무'
   ],
   '고슴도치': [
      '아프리카피그미고슴도치', '유럽고슴도치'
   ],
}

function PetFormPage({ mode }) {
  useAppBackground('app-bg--blue')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((s) => s.auth)
  const { pets } = useSelector((s) => s.pet)
  const { alert, alertModal } = useModalHelpers()

  const derivedMode = useMemo(() => {
    if (mode) return mode
    return location.pathname.includes('edit') ? 'edit' : 'create'
  }, [mode, location.pathname])

  const isEdit = derivedMode === 'edit'

  const locationPet = isEdit ? location.state?.pet ?? null : null
  const locationPetId = isEdit ? location.state?.petId ?? locationPet?.id ?? null : null

  const [currentPet, setCurrentPet] = useState(locationPet)

  useEffect(() => {
    if (isEdit && !locationPetId) {
      alert('수정할 반려동물 정보가 없습니다.', '오류', 'warning')
      navigate('/mypage', { replace: true })
    }
  }, [isEdit, locationPetId, navigate, alert])

  useEffect(() => {
    if (locationPet) {
      setCurrentPet(locationPet)
    }
  }, [locationPet])

  const petId = currentPet?.id ?? locationPetId

  const [form, setForm] = useState({
    petName: currentPet?.petName ?? '',
    petType: currentPet?.petType ?? '',
    breed: currentPet?.breed ?? '',
    gender: currentPet?.gender ?? '',
    age: currentPet?.age ?? '',
  })

  useEffect(() => {
    if (currentPet && isEdit) {
      const breed = currentPet.breed ?? ''
      const age = currentPet.age ?? 0
      
      setForm({
        petName: currentPet.petName ?? '',
        petType: currentPet.petType ?? '',
        breed: breed,
        gender: currentPet.gender ?? '',
        age: age,
      })
      
      // 품종이 옵션에 없으면 직접 입력 모드로
      const petType = currentPet.petType ?? ''
      if (petType && BREED_OPTIONS[petType]) {
        const isInOptions = BREED_OPTIONS[petType].includes(breed)
        if (!isInOptions && breed) {
          setShowBreedInput(true)
          setCustomBreed(breed)
        }
      }

      // 나이에 따라 ageRange 설정
      if (age < 1 && age > 0) {
        // 1살 미만 (개월 수로 저장되어 있을 수 있음)
        const months = Math.round(age * 12)
        setAgeRange('under_1')
        setAgeInMonths(months.toString())
        setShowAgeInput(true)
      } else if (age >= 1 && age < 12) {
        setAgeRange('1_to_11')
        setShowAgeInput(true)
      } else if (age >= 12) {
        setAgeRange('over_12')
        setShowAgeInput(true)
      }
    }
  }, [currentPet, isEdit])

  const [uploads, setUploads] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [successPet, setSuccessPet] = useState(null)
  const [showBreedInput, setShowBreedInput] = useState(false)
  const [customBreed, setCustomBreed] = useState('')
  const [showAgeInput, setShowAgeInput] = useState(false)
  const [ageRange, setAgeRange] = useState('')
  const [ageInMonths, setAgeInMonths] = useState('')

  const petDisplayName = useMemo(() => successPet?.petName || form.petName || '반려동물', [successPet?.petName, form.petName])

  useEffect(() => {
    const urls = uploads.map((file) => URL.createObjectURL(file))
    setPreviewUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [uploads])

  const currentImage = useMemo(() => {
    if (!isEdit || !currentPet?.images?.length) return null
    const raw = currentPet.images[0]?.imgUrl || currentPet.images[0]?.imageUrl || currentPet.imageUrl || currentPet.imgUrl
    if (!raw) return null
    if (raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
    if (raw.startsWith('/images/')) return raw
    return `${API_BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`
  }, [isEdit, currentPet])

  const displayedPreviews = useMemo(() => {
    if (uploads.length > 0) return previewUrls
    if (isEdit && currentImage) return [currentImage]
    return []
  }, [uploads.length, previewUrls, isEdit, currentImage])

  const updateField = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const genderOptions = useMemo(
    () => [
      { value: 'M', label: '남' },
      { value: 'F', label: '여' },
    ],
    []
  )

  const ageRangeOptions = useMemo(
    () => [
      { value: 'under_1', label: '1살 미만 (개월 수)' },
      { value: '1_to_11', label: '1-11살' },
      { value: 'over_12', label: '12살 이상' },
    ],
    []
  )

  // 품종 옵션 생성 (동물 종류에 따라 동적으로 변경)
  const breedOptions = useMemo(() => {
    if (!form.petType || !BREED_OPTIONS[form.petType]) {
      return [{ value: 'OTHER', label: '직접 입력' }]
    }
    
    const options = BREED_OPTIONS[form.petType].map(breed => ({
      value: breed,
      label: breed
    }))
    
    // "기타 품종" 옵션 추가
    options.push({ value: 'OTHER', label: '기타 품종 (직접입력)' })
    
    return options
  }, [form.petType])

  // 품종 변경 핸들러
  const handleBreedChange = (value) => {
    if (value === 'OTHER') {
      setShowBreedInput(true)
      setForm(prev => ({ ...prev, breed: '' }))
    } else {
      setShowBreedInput(false)
      setCustomBreed('')
      setForm(prev => ({ ...prev, breed: value }))
    }
  }

  // 직접 입력 품종 변경 핸들러
  const handleCustomBreedChange = (value) => {
    setCustomBreed(value)
    setForm(prev => ({ ...prev, breed: value }))
  }

  // 나이 범위 변경 핸들러
  const handleAgeRangeChange = (value) => {
    setAgeRange(value)
    setShowAgeInput(true)
    setForm(prev => ({ ...prev, age: '' }))
    setAgeInMonths('')
  }

  // 나이/개월 입력 핸들러
  const handleAgeInputChange = (value) => {
    const numValue = parseInt(value) || ''
    
    if (ageRange === 'under_1') {
      // 개월 수 입력 (1살 미만은 age를 0으로 저장)
      if (numValue === '' || (numValue >= 1 && numValue <= 11)) {
        setAgeInMonths(value)
        if (numValue) {
          setForm(prev => ({ ...prev, age: 0 })) // 1살 미만은 0으로 저장
        } else {
          setForm(prev => ({ ...prev, age: '' }))
        }
      }
    } else {
      // 나이 입력 (1살 이상인 경우 ageInMonths 초기화)
      setAgeInMonths('') // 이전 개월 수 값 제거
      
      if (ageRange === '1_to_11') {
        if (numValue === '' || (numValue >= 1 && numValue <= 11)) {
          setForm(prev => ({ ...prev, age: value }))
        }
      } else if (ageRange === 'over_12') {
        if (numValue === '' || numValue >= 12) {
          setForm(prev => ({ ...prev, age: value }))
        }
      }
    }
  }

  const handleImageChange = (files) => {
    if (isEdit) {
      setUploads(files.slice(0, 1))
    } else {
      setUploads(files.slice(0, MAX_FILES))
    }
  }

  const handleImageRemove = (index) => {
    setUploads((prev) => prev.filter((_, i) => i !== index))
  }

  const resetForm = () => {
    setForm({ petName: '', petType: '', breed: '', gender: '', age: '' })
    setUploads([])
    setSuccessPet(null)
    setShowBreedInput(false)
    setCustomBreed('')
    setShowAgeInput(false)
    setAgeRange('')
    setAgeInMonths('')
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(getUserPetsThunk())
    }
  }, [dispatch, user?.id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.petName.trim()) return alert('이름을 입력하세요.', '입력 필요', 'warning')
    if (!form.petType.trim()) return alert('동물 종류를 입력하세요.', '입력 필요', 'warning')
    if (!form.breed.trim()) return alert('품종을 입력하세요.', '입력 필요', 'warning')
    if (!form.gender) return alert('성별을 선택하세요.', '입력 필요', 'warning')
    
    // 나이 유효성 검사
    if (!showAgeInput || !ageRange) {
      return alert('나이 범위를 선택하세요.', '입력 필요', 'warning')
    }
    if (form.age === '' || Number(form.age) < 0) {
      if (ageRange === 'under_1') {
        return alert('개월 수를 입력하세요.', '입력 필요', 'warning')
      }
      return alert('나이를 입력하세요.', '입력 필요', 'warning')
    }
    
    const ageValue = Number(form.age)
    if (ageRange === 'under_1' && (!ageInMonths || Number(ageInMonths) < 1 || Number(ageInMonths) > 11)) {
      return alert('1~11 개월 사이의 값을 입력하세요.', '입력 필요', 'warning')
    } else if (ageRange === '1_to_11' && (ageValue < 1 || ageValue > 11)) {
      return alert('1~11살 사이의 값을 입력하세요.', '입력 필요', 'warning')
    } else if (ageRange === 'over_12' && ageValue < 12) {
      return alert('12살 이상의 값을 입력하세요.', '입력 필요', 'warning')
    }

    if (!isEdit) {
      const normalizedName = form.petName.trim().toLowerCase()
      const normalizedType = form.petType.trim().toLowerCase()
      const normalizedBreed = form.breed.trim().toLowerCase()

      const isDuplicate = pets.some((pet) => {
        const name = (pet.petName || '').trim().toLowerCase()
        const type = (pet.petType || '').trim().toLowerCase()
        const breed = (pet.breed || '').trim().toLowerCase()
        return name === normalizedName && type === normalizedType && breed === normalizedBreed
      })

      if (isDuplicate) {
        alert('이미 동일한 정보의 반려동물이 등록되어 있습니다.', '중복 확인', 'warning')
        return
      }
    }

    const fd = new FormData()
    fd.append('petName', form.petName)
    fd.append('petType', form.petType)
    fd.append('breed', form.breed)
    fd.append('gender', form.gender)
    fd.append('age', form.age)
    
    // 1살 미만인 경우 개월 수 전송, 아니면 빈 값으로 초기화
    if (ageRange === 'under_1' && ageInMonths) {
      fd.append('ageInMonths', ageInMonths)
    } else {
      fd.append('ageInMonths', '') // 1살 이상인 경우 명시적으로 빈 값 전송
    }

    if (isEdit) {
      if (uploads.length > 0) {
        const file = uploads[0]
        const safe = new File([file], encodeURIComponent(file.name), { type: file.type })
        fd.append('img', safe)
      }
      const updated = await dispatch(updatePetThunk({ id: petId, formData: fd })).unwrap()
      if (user?.id) await dispatch(getUserPetsThunk(user.id))
      const nextPet = updated?.pet ?? { 
        ...currentPet, 
        ...form,
        ageInMonths: ageRange === 'under_1' && ageInMonths ? Number(ageInMonths) : null
      }
      const previewSrc = uploads.length > 0 ? previewUrls[0] : null
      setCurrentPet(nextPet)
      setUploads([])
      setSuccessPet(previewSrc ? { ...nextPet, previewUrl: previewSrc } : nextPet)
    } else {
      uploads.forEach((file) => {
        const safe = new File([file], encodeURIComponent(file.name), { type: file.type })
        fd.append('img', safe)
      })
      const created = await dispatch(createPetThunk(fd)).unwrap()
      const newPet = created?.pet
      if (user?.id) await dispatch(getUserPetsThunk(user.id))
      const previewSrc = previewUrls[0] || newPet?.images?.[0]?.imgUrl || newPet?.imageUrl || newPet?.imgUrl
      resetForm()
      if (newPet) {
        setSuccessPet(previewSrc ? { ...newPet, previewUrl: previewSrc } : newPet)
      } else {
        setSuccessPet(null)
      }
    }
  }

  return (
    <section className="container py-5">
        <PageHeader
          title={isEdit ? '반려동물 프로필 수정' : '반려동물 등록'}
          onBack={() => navigate(-1)}
          className="mb-4"
          titleClassName="text-center text-lg-start"
          headingLevel="h1"
        />

        {successPet && (
          <PetProfileSuccessModal
            open
            onClose={() => setSuccessPet(null)}
            onNavigateMyPage={() => navigate('/mypage')}
            successPet={successPet}
            petDisplayName={petDisplayName}
            isEdit={isEdit}
            previewUrls={previewUrls}
            currentPet={currentPet}
            apiBaseUrl={API_BASE_URL}
          />
        )}

        <SectionCard
          title={isEdit ? '반려동물의 정보를 수정해주세요.' : '반려동물의 정보를 입력해주세요.'}
          headerActions={null}
          className="section-card--overflow-visible"
        >
          <form onSubmit={handleSubmit} className="pet-form p-4">
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label htmlFor="pet-name" className="pet-form__label">이름</label>
                <Input
                  id="pet-name"
                  name="petName"
                  placeholder="이름을 입력해주세요."
                  value={form.petName}
                  onChange={updateField('petName')}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="pet-type" className="pet-form__label">동물 종류</label>
                <Input
                  id="pet-type"
                  name="petType"
                  placeholder="예: 강아지 / 고양이"
                  value={form.petType}
                  onChange={updateField('petType')}
                  required
                />
              </div>

              <div className="col-12 col-md-6">
                <label htmlFor="pet-breed" className="pet-form__label">품종</label>
                {!showBreedInput ? (
                  <Selector
                  id="pet-breed"
                  name="breed"
                    value={form.breed || 'OTHER'}
                    onChange={handleBreedChange}
                    options={breedOptions}
                    placeholder="품종 선택"
                    className="pet-form__select"
                  />
                ) : (
                  <div className="d-flex gap-2">
                    <Input
                      id="pet-breed-custom"
                      name="breedCustom"
                      placeholder="품종을 직접 입력하세요"
                      value={customBreed}
                      onChange={handleCustomBreedChange}
                  required
                />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowBreedInput(false)
                        setCustomBreed('')
                        setForm(prev => ({ ...prev, breed: '' }))
                      }}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      선택으로
                    </Button>
                  </div>
                )}
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="pet-gender" className="pet-form__label">성별</label>
                <Selector
                  id="pet-gender"
                  name="gender"
                  value={form.gender}
                  onChange={updateField('gender')}
                  options={genderOptions}
                  placeholder="성별 선택"
                  className="pet-form__select"
                />
              </div>

              <div className="col-12 col-md-3">
                <label htmlFor="pet-age" className="pet-form__label">나이</label>
                {!showAgeInput ? (
                  <Selector
                    id="pet-age-range"
                    name="ageRange"
                    value={ageRange}
                    onChange={handleAgeRangeChange}
                    options={ageRangeOptions}
                    placeholder="나이 범위 선택"
                    className="pet-form__select"
                  />
                ) : (
                  <div className="d-flex gap-2 align-items-center">
                <Input
                  id="pet-age"
                  name="age"
                  type="number"
                      min={ageRange === 'under_1' ? '1' : ageRange === '1_to_11' ? '1' : '12'}
                      max={ageRange === 'under_1' ? '11' : ageRange === '1_to_11' ? '11' : ''}
                      placeholder={
                        ageRange === 'under_1' 
                          ? '개월' 
                          : ageRange === '1_to_11'
                            ? '1-11살'
                            : '12살 이상'
                      }
                      value={ageRange === 'under_1' ? ageInMonths : form.age}
                      onChange={handleAgeInputChange}
                  required
                />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAgeInput(false)
                        setAgeRange('')
                        setAgeInMonths('')
                        setForm(prev => ({ ...prev, age: '' }))
                      }}
                      style={{ whiteSpace: 'nowrap', minWidth: '60px' }}
                    >
                      재선택
                    </Button>
                  </div>
                )}
              </div>

              <div className="col-12">
                <ImageUpload
                  label={isEdit ? '대표 이미지 교체' : '이미지 선택'}
                  multiple={!isEdit}
                  maxFiles={MAX_FILES}
                  previewUrls={displayedPreviews}
                  onChange={handleImageChange}
                  onRemove={!isEdit ? handleImageRemove : undefined}
                  hint={
                    isEdit
                      ? `${petDisplayName}의 대표 이미지가 교체됩니다.`
                      : `${petDisplayName}의 이미지를 선택할 수 있어요.`
                  }
                  buttonText={isEdit ? '새 이미지 선택' : '이미지 업로드'}
                  id="pet-images"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
              <Button type="submit" variant="primary" size="lg">
                {isEdit ? '저장하기' : '등록하기'}
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

export default PetFormPage


