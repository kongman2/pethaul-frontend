import './PetTypeOptions.scss'

const PetTypeOptions = ({ options, selectedValue, onSelect }) => (
  <div className="pet-type-options row g-2 g-sm-4 justify-content-center mb-5">
    {options.map((option) => (
      <div key={option.value} className="col-4 col-sm-4 col-md-3 d-flex justify-content-center">
        <button
          type="button"
          className={`pet-type-card ${selectedValue === option.value ? 'pet-type-card--active' : ''}`}
          onClick={() => onSelect(option.value)}
        >
          <img className={`${option.className} pet-type-card__image`} src={option.image} alt={option.label} />
          <p className="pet-type-card__label mt-3 mb-0">{option.label}</p>
        </button>
      </div>
    ))}
  </div>
)

export default PetTypeOptions

