import { useState, useMemo, useEffect } from 'react'
import classNames from 'classnames'
import Input from '../Input/Input'
import SortDropdown from '../SortDropdown/SortDropdown'
import Button from '../Button/Button'
import './FilterForm.scss'

/**
 * 공통 필터 폼 컴포넌트
 * 
 * @param {Object} props
 * @param {Array} props.categoryOptions - 카테고리 옵션 [{id, name}]
 * @param {Array} props.statusOptions - 상태 옵션 [{value, label}]
 * @param {Array} props.tagOptions - 태그 옵션 [{value, label}] | null
 * @param {Object} props.values - 필터 값들 {q, status, tag, selectedCats, priceMin, priceMax, inStockOnly}
 * @param {Object} props.onChange - 변경 핸들러 {setQ, setStatus, setTag, setSelectedCats, setPriceMin, setPriceMax, setInStockOnly}
 * @param {Function} props.onSearch - 검색 핸들러 (e) => void
 * @param {Function} props.onReset - 초기화 핸들러 () => void
 * @param {boolean} props.showCategory - 카테고리 필터 표시 여부
 * @param {boolean} props.showPrice - 가격 필터 표시 여부
 * @param {boolean} props.showStatus - 상태 필터 표시 여부
 * @param {boolean} props.showTag - 태그 필터 표시 여부
 * @param {boolean} props.showSearch - 검색 필터 표시 여부
 * @param {boolean} props.showStockToggle - 재고 토글 표시 여부
 * @param {boolean} props.collapsible - 접기/펼치기 가능 여부
 * @param {string} props.variant - 스타일 변형 ('admin' | 'item')
 */
export default function FilterForm({
  categoryOptions = [],
  statusOptions = [],
  tagOptions = null,
  values: {
    q = '',
    status = 'all',
    tag = '',
    selectedCats = [],
    priceMin = '',
    priceMax = '',
    inStockOnly = false,
  } = {},
  onChange: {
    setQ,
    setStatus,
    setTag,
    setSelectedCats,
    setPriceMin,
    setPriceMax,
    setInStockOnly,
  } = {},
  onSearch,
  onReset,
  renderStatus,
  showCategory = false,
  showPrice = false,
  showStatus = false,
  showTag = false,
  showSearch = false,
  showStockToggle = false,
  collapsible = false,
  variant = 'admin', // 'admin' | 'item'
}) {
  const [isFilterOpen, setIsFilterOpen] = useState(!collapsible)
  const [inputPriceMin, setInputPriceMin] = useState(priceMin)
  const [inputPriceMax, setInputPriceMax] = useState(priceMax)

  // 카테고리 선택/해제
  const selectedCatsSet = useMemo(() => new Set(selectedCats), [selectedCats])
  
  const handleToggleCat = (name) => {
    if (!setSelectedCats) return
    const newCats = selectedCatsSet.has(name)
      ? selectedCats.filter((n) => n !== name)
      : [...selectedCats, name]
    setSelectedCats(newCats)
  }

  const clearCats = () => {
    if (setSelectedCats) setSelectedCats([])
  }

  // 가격 필터 적용
  const handleApplyPrice = () => {
    if (setPriceMin) setPriceMin(inputPriceMin)
    if (setPriceMax) setPriceMax(inputPriceMax)
    if (onSearch) onSearch({ preventDefault: () => {} })
  }

  const handleResetPrice = () => {
    setInputPriceMin('')
    setInputPriceMax('')
    if (setPriceMin) setPriceMin('')
    if (setPriceMax) setPriceMax('')
  }

  const handleReset = () => {
    if (setQ) setQ('')
    if (setStatus) setStatus('all')
    if (setTag) setTag('')
    if (setSelectedCats) setSelectedCats([])
    handleResetPrice()
    if (setInStockOnly) setInStockOnly(false)
    if (onReset) onReset()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(e)
  }

  const filterClassName = classNames('filter-form', `filter-form--${variant}`, {
    'filter-form--collapsible': collapsible,
  })

  const formClassName = classNames(filterClassName, 'filter-form__panel', 'row', 'g-2')
  const columnClassName = showSearch ? 'col-auto' : 'col-auto'

  const showInlineActions = showStockToggle || (onSearch && !showSearch) || (onReset && !showSearch)

  const renderSearchSection = () => (
    <div className="col-auto">
      <div className="filter-form__row filter-form__row--grow mb-0">
        <Input
          type="text"
          placeholder="검색어"
          value={q}
          onChange={(value) => setQ?.(value)}
          rightButton={
            onSearch
              ? {
                  text: '검색',
                  type: 'submit',
                  variant: 'primary',
                  size: 'sm',
                }
              : undefined
          }
        />
      </div>
    </div>
  )

  useEffect(() => {
    setInputPriceMin(priceMin)
  }, [priceMin])

  useEffect(() => {
    setInputPriceMax(priceMax)
  }, [priceMax])

  if (collapsible && !isFilterOpen) return null

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      {showInlineActions && (
        <div className="w-100">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 filter-form__actions--inline">
            {showStockToggle && (
              <div className="filter-form__stock-toggle">
              <label className="filter-form__switch">
                <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly?.(e.target.checked)} />
                <span className="filter-form__slider"></span>
              </label>
              <span className="filter-form__switch-label">재고만</span>
            </div>
            )}

            {((onSearch && !showSearch) || (onReset && !showSearch)) && (
              <div className="filter-form__actions-buttons d-flex gap-2">
            {onReset && !showSearch && (
                  <button type="button" className="filter-form__btn-ghost" onClick={handleReset}>
                    초기화
                  </button>
                )}
                {onSearch && !showSearch && (
                  <button type="submit" className="filter-form__btn-primary">
                    검색
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {showCategory && categoryOptions.length > 0 && (
        <div className="w-100">
          <div className="filter-form__row">
            <div className="filter-form__chips d-flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <button
                  type="button"
                  key={c.name || c.id}
                  className={`filter-form__chip ${selectedCatsSet.has(c.name) ? 'active' : ''}`}
                  onClick={() => handleToggleCat(c.name)}
                >
                  #{c.name}
                </button>
              ))}
              {selectedCats.length > 0 && (
                <button type="button" className="filter-form__btn-subtle" onClick={clearCats}>
                  전체 해제
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPrice && (
        <div className="col-auto">
          <div className="filter-form__row">
            <div className="filter-form__price">
              <Input
                type="text"
                placeholder="최저가"
                value={inputPriceMin}
                onChange={(value) => setInputPriceMin(value.replace(/[^\d]/g, ''))}
                className="filter-form__price-input"
              />
              <span className="filter-form__dash">~</span>
              <Input
                type="text"
                placeholder="최고가"
                value={inputPriceMax}
                onChange={(value) => setInputPriceMax(value.replace(/[^\d]/g, ''))}
                className="filter-form__price-input"
              />
              <Button type="button" size="sm" variant="primary" onClick={handleApplyPrice}>
                적용
              </Button>
              {(priceMin || priceMax) && (
                <Button type="button" size="sm" variant="ghost" onClick={handleResetPrice}>
                  초기화
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {variant === 'admin' && showSearch && renderSearchSection()}

      {showStatus && statusOptions.length > 0 && (
        <div className="col-auto d-flex align-items-center">
          <div className="filter-form__row mb-0">
            {renderStatus ? (
              renderStatus({
                value: status,
                options: statusOptions,
                onChange: setStatus,
              })
            ) : variant === 'item' ? (
              <div className="filter-form__segmented d-flex flex-wrap gap-2">
                {statusOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt.value}
                    className={`filter-form__seg-btn ${status === opt.value ? 'active' : ''}`}
                    onClick={() => setStatus?.(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <SortDropdown options={statusOptions} value={status} onChange={(value) => setStatus?.(value)} />
            )}
          </div>
        </div>
      )}

      {showTag && Array.isArray(tagOptions) && tagOptions.length > 0 && (
        <div className="col-auto d-flex align-items-center">
          <div className="filter-form__row mb-0">
            {variant === 'admin' ? (
              <SortDropdown options={tagOptions} value={tag} onChange={(value) => setTag?.(value)} />
            ) : (
              <select
                value={tag}
                onChange={(e) => setTag?.(e.target.value)}
                className="form-select form-select-sm filter-form__select mt-2"
              >
                {tagOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}

      {variant !== 'admin' && showSearch && renderSearchSection()}
    </form>
  )
}

