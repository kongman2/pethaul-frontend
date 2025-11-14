import PropTypes from 'prop-types'

import { Button, Modal } from '../../common'
import { getPetProfileImage } from '../../../utils/imageUtils'
import './PetProfileSuccessModal.scss'

function resolveImageSrc({ successPet, previewUrls = [], currentPet, apiBaseUrl = '' }) {
  const candidates = [
    successPet?.previewUrl,
    previewUrls[0],
    successPet?.images?.[0]?.imgUrl,
    successPet?.images?.[0]?.imageUrl,
    successPet?.imageUrl,
    successPet?.imgUrl,
    successPet?.photoUrl,
    successPet?.thumbnailUrl,
    currentPet?.images?.[0]?.imgUrl,
    currentPet?.imageUrl,
    currentPet?.imgUrl,
  ].filter(Boolean)

  const raw = candidates.find(Boolean)
  if (!raw) return getPetProfileImage()
  if (raw.startsWith('http') || raw.startsWith('blob:') || raw.startsWith('data:')) return raw
  if (raw.startsWith('/images/')) return raw
  return `${apiBaseUrl}${raw.startsWith('/') ? '' : '/'}${raw}`
}

function PetProfileSuccessModal({
  open,
  onClose,
  onNavigateMyPage,
  successPet,
  isEdit,
  petDisplayName,
  previewUrls,
  currentPet,
  apiBaseUrl,
}) {
  const imageSrc = resolveImageSrc({ successPet, previewUrls, currentPet, apiBaseUrl })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `${petDisplayName}의 프로필이 수정되었습니다.` : `${petDisplayName}의 프로필이 등록되었습니다.`}
      size="lg"
      bodyClassName="pet-success-modal__body"
      footer={
        <div className="pet-success-modal__actions">
          <Button variant="primary" size="sm" onClick={onNavigateMyPage}>
            마이페이지에서 보기
          </Button>
          {!isEdit && (
            <Button variant="outline" size="sm" onClick={onClose}>
              다른 펫 추가하기
            </Button>
          )}
          {isEdit && (
            <Button variant="outline" size="sm" onClick={onClose}>
              계속 수정하기
            </Button>
          )}
        </div>
      }
    >
      <div className="pet-success-modal__content">
        <div className="pet-success-modal__image" aria-hidden={!imageSrc}>
          <img src={imageSrc} alt={`${petDisplayName} 대표 이미지`} />
        </div>
        <div className="pet-success-modal__details">
          <h3 className="pet-success-modal__name">{successPet?.petName}</h3>
          <p>
            {successPet?.petType} / {successPet?.breed}
          </p>
          <p>
            나이: {successPet?.ageInMonths ? `${successPet.ageInMonths}개월` : `${successPet?.age}살`}
          </p>
          <p>성별: {successPet?.gender === 'M' ? '남' : '여'}</p>
        </div>
      </div>
    </Modal>
  )
}

PetProfileSuccessModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onNavigateMyPage: PropTypes.func.isRequired,
  successPet: PropTypes.object,
  isEdit: PropTypes.bool,
  petDisplayName: PropTypes.string,
  previewUrls: PropTypes.arrayOf(PropTypes.string),
  currentPet: PropTypes.object,
  apiBaseUrl: PropTypes.string,
}

export default PetProfileSuccessModal
