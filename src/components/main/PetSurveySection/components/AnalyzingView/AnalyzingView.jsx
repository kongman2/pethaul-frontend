import './AnalyzingView.scss'

const AnalyzingView = ({ petName }) => (
  <section id="pet-survey-analyzing" className="container py-5">
    <div className="text-center">
      <div className="analyzing-view">
        <div className="analyzing-view__icon">🔍</div>
        <h2 className="analyzing-view__title">{petName}의 성격을 분석하고 있어요...</h2>
        <div className="analyzing-view__spinner">
          <div className="analyzing-view__dot" />
          <div className="analyzing-view__dot" />
          <div className="analyzing-view__dot" />
        </div>
      </div>
    </div>
  </section>
)

export default AnalyzingView

