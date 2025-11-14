import { useEffect, useMemo, useState } from 'react'

import './QuantityControl.scss'

function normalizeNumber(value, fallback) {
  const num = Number(value)
  return Number.isFinite(num) ? num : fallback
}

function QuantityControl({
  value = 1,
  min = 1,
  max = 99,
  step = 1,
  editable = true,
  disabled = false,
  onChange,
  variant,
  className = '',
  minusLabel = '−',
  plusLabel = '+',
  name,
  id,
  ariaLabel = '수량 선택',
}) {
  const [displayValue, setDisplayValue] = useState(String(value ?? min))

  useEffect(() => {
    setDisplayValue(String(value ?? min))
  }, [value, min])

  const clamp = (num) => {
    const base = normalizeNumber(num, min)
    const next = Math.min(Math.max(min, base), max)
    return next
  }

  const commit = (next) => {
    const clamped = clamp(next)
    setDisplayValue(String(clamped))
    onChange?.(clamped)
  }

  const numericValue = clamp(displayValue)

  const decrement = () => commit(numericValue - step)
  const increment = () => commit(numericValue + step)

  const rootClassName = useMemo(() => {
    const classes = ['quantity-control']
    if (variant) classes.push(`quantity-control--${variant}`)
    if (editable) classes.push('quantity-control--editable')
    if (className) classes.push(className)
    return classes.join(' ')
  }, [variant, editable, className])

  return (
    <div className={rootClassName} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        className="quantity-control__button"
        onClick={decrement}
        disabled={disabled || numericValue <= min}
        aria-label="수량 감소"
      >
        {minusLabel}
      </button>

      {editable ? (
        <input
          id={id}
          name={name}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={(event) => setDisplayValue(event.target.value)}
          onBlur={() => commit(displayValue)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit(displayValue)
            } else if (event.key === 'ArrowUp') {
              event.preventDefault()
              commit(normalizeNumber(displayValue, min) + step)
            } else if (event.key === 'ArrowDown') {
              event.preventDefault()
              commit(normalizeNumber(displayValue, min) - step)
            }
          }}
          onWheel={(event) => event.currentTarget.blur()}
          className="quantity-control__input"
          disabled={disabled}
          aria-live="polite"
        />
      ) : (
        <span className="quantity-control__value" aria-live="polite">
          {displayValue}
        </span>
      )}

      <button
        type="button"
        className="quantity-control__button"
        onClick={increment}
        disabled={disabled || numericValue >= max}
        aria-label="수량 증가"
      >
        {plusLabel}
      </button>
    </div>
  )
}

export default QuantityControl

