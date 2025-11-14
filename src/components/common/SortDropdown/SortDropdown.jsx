import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'

import './SortDropdown.scss'

function SortDropdown({ options = [], value, onChange }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!open) return

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const handleSelect = (selectedValue) => {
    if (selectedValue === value) {
      setOpen(false)
      return
    }
    onChange?.(selectedValue)
    setOpen(false)
  }

  const currentLabel = options.find((opt) => opt.value === value)?.label ?? value

  return (
    <div className="sort-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="sort-dropdown__button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{currentLabel}</span>
        <Icon icon="pixelarticons:chevron-down" width={16} height={16} aria-hidden="true" />
      </button>
      {open && (
        <ul className="sort-dropdown__menu" role="listbox">
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                className={`sort-dropdown__item ${value === option.value ? 'is-active' : ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

SortDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func,
}

export default SortDropdown

