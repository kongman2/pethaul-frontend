import { Button } from '../../../../common'
import './SurveyOptions.scss'

const SurveyOptions = ({ options, selectedValue, onSelect, questionType }) => (
  <div className="survey-options row g-3 justify-content-center mb-5">
    {options.map((option) => {
      const isGenderButton = questionType === 'gender'
      const genderClass = isGenderButton
        ? option.value === 'M'
          ? 'survey-option-btn--male'
          : 'survey-option-btn--female'
        : ''

      return (
        <div key={option.value} className="col-12 col-sm-6 col-md-4">
          <Button
            variant={selectedValue === option.value ? 'primary' : 'outline'}
            size="lg"
            fullWidth
            onClick={() => onSelect(option.value)}
            className={`survey-option-btn ${genderClass}`}
          >
            {option.label}
          </Button>
        </div>
      )
    })}
  </div>
)

export default SurveyOptions

