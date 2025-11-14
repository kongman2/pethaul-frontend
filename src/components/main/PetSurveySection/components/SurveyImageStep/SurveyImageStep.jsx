import { Button, ImageUpload } from '../../../../common'
import './SurveyImageStep.scss'

const SurveyImageStep = ({ imagePreview, onChange, onRemove, onSkip, onComplete, hasImage }) => (
  <div className="survey-image-step row justify-content-center mb-5">
    <div className="col-12 col-md-8 col-lg-6">
      <ImageUpload
        label=""
        previewUrls={imagePreview ? [imagePreview] : []}
        onChange={onChange}
        onRemove={onRemove}
        hint="반려동물의 귀여운 사진을 보여주세요! (최대 5MB)"
        buttonText="사진 선택하기"
        controlsAlign="center"
        previewAlign="center"
      />

      <div className="d-flex gap-2 mt-4">
        <Button variant="outline" size="lg" onClick={onSkip} style={{ flex: '0 0 120px' }}>
          건너뛰기
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={onComplete} disabled={!hasImage}>
          완료
        </Button>
      </div>
    </div>
  </div>
)

export default SurveyImageStep

