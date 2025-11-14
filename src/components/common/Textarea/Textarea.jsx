import React, { useState, useEffect } from 'react'
import './Textarea.scss'

/**
 * Textarea Props:
 * - label?: string (라벨 텍스트)
 * - placeholder?: string (플레이스홀더 텍스트)
 * - value?: string (입력값)
 * - onChange?: (value: string) => void (값 변경 핸들러)
 * - onBlur?: () => void (포커스 아웃 핸들러)
 * - disabled?: boolean (비활성화 상태)
 * - required?: boolean (필수 입력 여부)
 * - className?: string (추가 CSS 클래스)
 * - id?: string (요소 ID)
 * - name?: string (요소 이름)
 * - state?: 'success' | 'warning' | 'error' (입력 상태)
 * - error?: string (에러 메시지)
 * - rows?: number (행 수)
 * - maxLength?: number (최대 길이)
 * - showCounter?: boolean (글자 수 카운터 표시)
 */
export const Textarea = ({
  label,
  placeholder,
  value = '',
  onChange,
  onBlur,
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  state,
  error,
  rows = 4,
  maxLength,
  showCounter = false,
}) => {
  const [textareaValue, setTextareaValue] = useState(value)

  useEffect(() => {
    setTextareaValue(value)
  }, [value])

  const handleChange = (e) => {
    const newValue = e.target.value
    if (maxLength && newValue.length > maxLength) {
      return
    }
    setTextareaValue(newValue)
    onChange?.(newValue)
  }

  const textareaClasses = [
    'pethaul-textarea',
    state && `pethaul-textarea--${state}`,
    error && 'pethaul-textarea--error',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const textareaElement = (
    <>
      <textarea
        className={textareaClasses}
        placeholder={placeholder}
        value={textareaValue}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        id={id}
        name={name}
        rows={rows}
        maxLength={maxLength}
      />
      {showCounter && maxLength && (
        <div className="textarea-counter">
          <span className={textareaValue.length > maxLength * 0.9 ? 'warning' : ''}>
            {textareaValue.length}/{maxLength}
          </span>
        </div>
      )}
    </>
  )

  if (label) {
    return (
      <div className="pethaul-textarea-container">
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        <div className="pethaul-textarea-wrapper">
          {textareaElement}
        </div>
        {error && (
          <div className="invalid-feedback d-block mt-1">{error}</div>
        )}
      </div>
    )
  }

  return (
    <div className="pethaul-textarea-wrapper">
      {textareaElement}
    </div>
  )
}

export default Textarea

