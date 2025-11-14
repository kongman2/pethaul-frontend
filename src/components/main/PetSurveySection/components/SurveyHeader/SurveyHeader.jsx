import './SurveyHeader.scss'
import 발바닥Img from '../../../../../assets/발바닥.png'

const SurveyHeader = ({ question, currentStep, totalSteps }) => (
  <div className="survey-header text-center mb-4">
    <div className="survey-header__title-with-paw">
      <h2 className="survey-header__title">너에 대해 알려줄래?</h2>
      <img src={발바닥Img} alt="발바닥" className="survey-header__paw" />
    </div>
    <p className="survey-header__subtitle">{question}</p>
    <div className="survey-header__progress-info">
      <span className="survey-header__progress-text">
        {currentStep + 1} / {totalSteps}
      </span>
    </div>
  </div>
)

export default SurveyHeader

