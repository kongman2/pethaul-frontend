import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, A11y, Keyboard, Mousewheel } from 'swiper/modules'
import { Icon } from '@iconify/react'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import PetProfile from '../My/PetProfileCard/PetProfileCard'
import { Button, ConfirmModal, AlertModal } from '../common'
import { useConfirmModal } from '../../hooks/useConfirmModal'
import { useAlertModal } from '../../hooks/useAlertModal'
import './CommonSlider.scss'

/**
 * props:
 *  - pets: Pet[]
 *  - onDelete?: (petId: number) => Promise<void> | void   // 삭제 콜백(선택)
 */
function PetProfileSlider({ pets, onDelete }) {
  const navigate = useNavigate()
  const list = Array.isArray(pets) ? pets : []
  const total = list.length
  const [activeIndex, setActiveIndex] = useState(0)
  
  const confirmModal = useConfirmModal()
  const alertModal = useAlertModal()

  const goEdit = useCallback((pet) => {
    if (!pet) return
    navigate('/peteditpage', { state: { petId: pet.id, pet } })
  }, [navigate])

  const goCreate = useCallback(() => navigate('/pets'), [navigate])

  const handleDelete = useCallback((pet) => {
    if (!pet) return
    confirmModal.open({
      title: '삭제 확인',
      message: `정말 "${pet.name ?? '이 반려동물'}" 정보를 삭제하시겠어요?`,
      confirmText: '삭제',
      cancelText: '취소',
      variant: 'danger',
      onConfirm: async () => {
        try {
          if (onDelete) {
            await onDelete(pet.id)
            alertModal.open({
              title: '완료',
              message: '반려동물 정보가 삭제되었습니다.',
              variant: 'success',
            })
          } else {
          }
        } catch (e) {
          alertModal.open({
            title: '오류',
            message: '삭제 중 오류가 발생했어요.',
            variant: 'danger',
          })
        }
      },
    })
  }, [onDelete, confirmModal, alertModal])

  const currentPet = activeIndex < total ? list[activeIndex] : null
  const isAddSlide = activeIndex === total

  if (!total) {
    return (
      <section className="d-flex flex-column align-items-center justify-content-center gap-4 py-4">
        <Button variant="cart" size="lg" onClick={goCreate} aria-label="add">
          반려동물 등록하기 +
        </Button>
        <p className="text-muted mb-0">등록된 반려동물이 없습니다.</p>
      </section>
    )
  }

  return (
    <section className="py-4">
      <div className="d-flex flex-column gap-3">
        {/* Swiper 슬라이더 */}
        <div className="commmon-horizontal petprofile-slider position-relative">
          <Swiper
            modules={[Navigation, Pagination, A11y, Keyboard, Mousewheel]}
            navigation={{
              prevEl: '.petprofile-nav-prev',
              nextEl: '.petprofile-nav-next',
            }}
            pagination={false}
            keyboard={{ enabled: true }}
            mousewheel={{ forceToAxis: true, releaseOnEdges: true }}
            a11y={{ enabled: true }}
            slidesPerView={1}
            spaceBetween={0}
            onSlideChange={(swiper) => {
              setActiveIndex(swiper.activeIndex)
            }}
          >
            {list.map((pet) => (
              <SwiperSlide key={pet.id} className="commmon-slide">
                <PetProfile pet={pet} />
              </SwiperSlide>
            ))}
            {/* 추가하기 슬라이드 */}
            <SwiperSlide className="commmon-slide">
              <div className="p-5 d-flex flex-column align-items-center justify-content-center gap-3 text-center h-100">
                <p className="mb-0">새 반려동물을 등록해보세요!</p>
                <Button variant="primary" size="sm" onClick={goCreate}>
                  + 추가하기
                </Button>
              </div>
            </SwiperSlide>
          </Swiper>

          {/* 커스텀 네비게이션 버튼 */}
          {total > 0 && (
            <>
              <button className="petprofile-nav-prev" aria-label="이전">
                <Icon icon="pixel:angle-left" width={20} height={20} />
              </button>
              <button className="petprofile-nav-next" aria-label="다음">
                <Icon icon="pixel:angle-right" width={20} height={20} />
              </button>
            </>
          )}
        </div>

        {/* 하단 액션 */}
        <div className="pet-actions d-flex flex-column flex-md-row justify-content-end gap-3 px-4 pb-4">

          {!isAddSlide && currentPet && (
            <>
              <Button variant="primary" size="sm" onClick={goCreate} aria-label="add">
                + 추가
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goEdit(currentPet)}
                aria-label="edit"
              >
                편집하기
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDelete(currentPet)}
                aria-label="delete"
              >
                삭제하기
              </Button>
            </>
          )}
        </div>
      </div>
      
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

export default PetProfileSlider
