import React, { useState, useEffect, forwardRef } from 'react'
import { Icon } from '@iconify/react'
import Button from '../Button/Button'
import './Input.scss'

/**
 * Input Props:
 * - label?: string (라벨 텍스트)
 * - as?: 'input' | 'textarea' (default: 'input')
 * - type?: 'text' | 'email' | 'password' | 'number' | 'tel' (입력 타입, textarea에서는 무시)
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
 * - showPasswordToggle?: boolean (비밀번호 표시 토글, textarea에서는 비활성)
 * - rightButton?: { text: string, onClick: () => void, variant: string, size: string } (우측 버튼)
 * - rows?: number (textarea일 때 행 수)
 * - variant?: 'auth' | string (스타일 변형)
 */
export const Input = forwardRef(({
  label,
  as = 'input',
  type = 'text',
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
  showPasswordToggle = false,
  rightButton,
  rows,
  variant,
  ...rest
}, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(newValue)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const isTextarea = as === 'textarea'
  const inputType = !isTextarea && type === 'password' && showPassword ? 'text' : type
  const isFilled = String(inputValue ?? '').length > 0

  const inputClasses = [
    'pethaul-input',
    isTextarea && 'pethaul-input--textarea',
    variant && `pethaul-input--${variant}`,
    state && `pethaul-input--${state}`,
    isFilled && 'pethaul-input--filled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const commonProps = {
    className: inputClasses,
    placeholder,
    value: inputValue,
    onChange: handleChange,
    onBlur,
    disabled,
    required,
    id,
    name,
    ...rest,
  }

  if (isTextarea) {
    if (rows) {
      commonProps.rows = rows
    }
  } else {
    commonProps.type = inputType
  }

  const Element = isTextarea ? 'textarea' : 'input'

  const inputElement = <Element ref={ref} {...commonProps} />

  const hasRightButton = Boolean(rightButton?.text)
  const canShowPasswordToggle = showPasswordToggle && !isTextarea && type === 'password'

  const renderInputWithWrapper = () => {
    if (canShowPasswordToggle || hasRightButton) {
      const {
        text: rightButtonText,
        onClick: rightButtonOnClick,
        variant: rightButtonVariant = 'primary',
        size: rightButtonSize = 'sm',
        type: rightButtonType = 'button',
        className: rightButtonClassName,
        disabled: rightButtonDisabled = false,
      } = rightButton || {}

      const wrapperClassName = [
        'pethaul-input-wrapper',
        rightButtonText ? 'pethaul-input-wrapper--with-button' : '',
      ]
        .filter(Boolean)
        .join(' ')

      return (
        <div className={wrapperClassName}>
          {inputElement}
          {canShowPasswordToggle && (
            <button
              className="password-toggle-icon"
              type="button"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <Icon icon={showPassword ? 'pixelarticons:eye' : 'pixelarticons:eye-closed'} width={20} height={20} />
            </button>
          )}
          {rightButtonText && (
            <div className="right-button-wrapper">
              <Button
                type={rightButtonType}
                onClick={rightButtonOnClick}
                variant={rightButtonVariant}
                size={rightButtonSize}
                className={rightButtonClassName}
                disabled={rightButtonDisabled}
              >
                {rightButtonText}
              </Button>
            </div>
          )}
        </div>
      )
    }

    return inputElement
  }

  // label이 있는 경우 전체를 감싸서 반환
  if (label) {
    return (
      <div className="pethaul-input-container">
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
        {renderInputWithWrapper()}
        {error && (
          <div className="invalid-feedback d-block mt-1">{error}</div>
        )}
      </div>
    )
  }

  return renderInputWithWrapper()
})

Input.displayName = 'Input'

export default Input

