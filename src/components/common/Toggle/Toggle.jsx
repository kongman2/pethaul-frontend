import React from 'react'
import './Toggle.scss'

/**
 * Toggle Props:
 * - checked?: boolean (토글 상태)
 * - onChange?: (checked: boolean) => void (상태 변경 핸들러)
 * - disabled?: boolean (비활성화 상태)
 * - className?: string (추가 CSS 클래스)
 * - id?: string (요소 ID)
 * - name?: string (요소 이름)
 * - label?: string (라벨 텍스트)
 */
export const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  className = '',
  id,
  name,
  label,
}) => {
  const handleChange = (e) => {
    if (!disabled) {
      onChange?.(e.target.checked)
    }
  }

  return (
    <div className={`pethaul-toggle-wrapper ${className}`}>
      {label && <span className="toggle-label">{label}</span>}
      <label className={`pethaul-toggle ${disabled ? 'pethaul-toggle--disabled' : ''}`}>
        <input
          type="checkbox"
          className="pethaul-toggle__input"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          id={id}
          name={name}
        />
        <span className="pethaul-toggle__slider"></span>
      </label>
    </div>
  )
}

export default Toggle

