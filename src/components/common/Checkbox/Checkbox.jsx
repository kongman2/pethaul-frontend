import React from 'react'
import './Checkbox.scss'

/**
 * Checkbox Props:
 * - checked?: boolean (체크 상태)
 * - onChange?: (checked: boolean) => void (체크 변경 핸들러)
 * - label?: string (라벨 텍스트)
 * - className?: string (추가 CSS 클래스)
 * - id?: string (요소 ID)
 * - name?: string (요소 이름)
 * - disabled?: boolean (비활성화 상태)
 * - state?: 'success' | 'error' (체크박스 상태)
 */
export const Checkbox = ({
  checked = false,
  onChange,
  label,
  className = '',
  id,
  name,
  disabled = false,
  state,
}) => {
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked)
    }
  }

  const checkboxClasses = [
    'pethaul-checkbox',
    state && `pethaul-checkbox--${state}`,
    disabled && 'pethaul-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="checkbox-item">
      <label className={checkboxClasses}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          id={id}
          name={name}
        />
        <span className="checkmark"></span>
        {label && <span className="checkbox-label">{label}</span>}
      </label>
    </div>
  )
}

export default Checkbox

