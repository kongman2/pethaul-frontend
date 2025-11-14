import './SurveyProgress.scss'

const SurveyProgress = ({ progress }) => (
  <div className="survey-progress row justify-content-center mb-5">
    <div className="col-12 col-md-10 col-lg-8">
      <div className="survey-progress__container">
        <div className="survey-progress__bar progress">
          <div
            className="survey-progress__bar-fill progress-bar"
            role="progressbar"
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>
      </div>
    </div>
  </div>
)

export default SurveyProgress

