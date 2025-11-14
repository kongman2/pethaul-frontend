import React, { useState, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'
import './Selector.scss'

/**
 * SelectorOption:
 * - value: string (옵션 값)
 * - label: string (옵션 라벨)
 * - disabled?: boolean (비활성화 여부)
 */
export const SelectorOption = ({ value, label, disabled = false }) => ({
  value,
  label,
  disabled,
})

/**
 * Selector Props:
 * - options: Array<{value: string, label: string, disabled?: boolean}> (옵션 목록)
 * - value?: string | string[] (선택된 값)
 * - onChange?: (value: string | string[]) => void (값 변경 핸들러)
 * - placeholder?: string (플레이스홀더)
 * - disabled?: boolean (비활성화 상태)
 * - className?: string (추가 CSS 클래스)
 * - id?: string (요소 ID)
 * - name?: string (요소 이름)
 * - label?: string (라벨 텍스트)
 * - required?: boolean (필수 입력 여부)
 * - state?: 'success' | 'warning' | 'error' (입력 상태)
 * - variant?: string (스타일 변형)
 * - multiple?: boolean (다중 선택 여부)
 */
export const Selector = ({
  options = [],
  value = '',
  onChange,
  placeholder = '선택하세요',
  disabled = false,
  className = '',
  id,
  name,
  label,
  required = false,
  state,
  variant,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const isMultiple = Boolean(multiple)
  const [selectedValue, setSelectedValue] = useState(
    isMultiple ? (Array.isArray(value) ? value : []) : value,
  )
  const wrapperRef = useRef(null)

  useEffect(() => {
    setSelectedValue(isMultiple ? (Array.isArray(value) ? value : []) : value)
  }, [value, isMultiple])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (optionValue) => {
    if (isMultiple) {
      setSelectedValue((prev) => {
        const current = Array.isArray(prev) ? prev : []
        const exists = current.includes(optionValue)
        const updated = exists ? current.filter((val) => val !== optionValue) : [...current, optionValue]
        onChange?.(updated)
        return updated
      })
    } else {
    setSelectedValue(optionValue)
    onChange?.(optionValue)
    setIsOpen(false)
  }
  }

  const handleNativeSelectChange = (event) => {
    if (isMultiple) {
      const selectedOptions = Array.from(event.target.selectedOptions || []).map((opt) => opt.value)
      setSelectedValue(selectedOptions)
      onChange?.(selectedOptions)
    } else {
      handleSelect(event.target.value)
    }
  }

  const selectedOption = !isMultiple
    ? options.find((option) => option.value === selectedValue)
    : null

  const selectedLabels = isMultiple
    ? (Array.isArray(selectedValue) ? selectedValue : []).map((val) => {
        const option = options.find((opt) => opt.value === val)
        return option?.label ?? val
      })
    : selectedOption?.label

  const selectorClasses = [
    'pethaul-selector-wrapper',
    variant && `pethaul-selector-wrapper--${variant}`,
    state && `pethaul-selector-wrapper--${state}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const triggerClasses = [
    'pethaul-selector-trigger',
    isOpen ? 'open' : '',
    disabled ? 'disabled' : '',
    (isMultiple ? (selectedLabels?.length > 0) : Boolean(selectedOption)) ? 'has-value' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={selectorClasses}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ms-1">*</span>}
        </label>
      )}
      <div ref={wrapperRef} className="position-relative">
        <div
          className={triggerClasses}
          onClick={() => {
            if (!disabled) {
              setIsOpen(!isOpen)
            }
          }}
        >
          <div className="pethaul-selector-trigger__content">
            {isMultiple ? (
              selectedLabels?.length ? (
                <div className="selected-multiple">
                  {selectedLabels.map((labelText, index) => (
                    <span key={`${labelText}-${index}`} className="selected-tag">
                      {labelText}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="placeholder">{placeholder}</span>
              )
            ) : (
        <span className={selectedOption ? 'selected' : 'placeholder'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
            )}
          </div>
          <Icon icon="lucide:chevron-down" width="20" height="20" className={isOpen ? 'rotated' : ''} />
      </div>

      {isOpen && !disabled && (
        <div className="pethaul-selector-dropdown">
            {options.map((option) => {
              const isSelected = isMultiple
                ? Array.isArray(selectedValue) && selectedValue.includes(option.value)
                : selectedValue === option.value

              return (
            <div
              key={option.value}
                  className={`pethaul-selector-option ${option.disabled ? 'disabled' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => !option.disabled && handleSelect(option.value)}
            >
              {option.label}
            </div>
              )
            })}
        </div>
      )}

      {/* Hidden select for form submission */}
      <select
        className="d-none"
        value={selectedValue}
          onChange={handleNativeSelectChange}
        disabled={disabled}
        id={id}
        name={name}
          multiple={isMultiple}
      >
          {!isMultiple && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      </div>
    </div>
  )
}

export default Selector

