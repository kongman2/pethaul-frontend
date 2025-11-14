import { Button, Input } from '../../../../common'
import './SurveyInputForm.scss'

const SurveyInputForm = ({
  value,
  onChange,
  onSubmit,
  placeholder,
  inputType = 'text',
  showBreedCancel = false,
  onBreedCancel,
  showAgeCancel = false,
  onAgeCancel,
  isSubmitDisabled,
}) => (
  <div className="survey-input-form row justify-content-center mb-5">
    <div className="col-12 col-md-8 col-lg-6">
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <Input
            type={inputType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="survey-input-form__input"
          />
        </div>
        <div className="d-flex gap-2">
          {showBreedCancel && (
            <Button type="button" variant="outline" size="lg" onClick={onBreedCancel} style={{ flex: '0 0 100px' }}>
              취소
            </Button>
          )}
          {showAgeCancel && (
            <Button type="button" variant="outline" size="lg" onClick={onAgeCancel} style={{ flex: '0 0 100px' }}>
              취소
            </Button>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitDisabled}>
            다음
          </Button>
        </div>
      </form>
    </div>
  </div>
)

export default SurveyInputForm

