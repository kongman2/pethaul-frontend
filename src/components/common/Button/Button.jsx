import React, { memo } from 'react'
import './Button.scss'

/**
 * Button Props:
 * - children: React.ReactNode (버튼 내용)
 * - variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'dropdown' (버튼 스타일)
 * - size?: 'sm' | 'md' | 'lg' (버튼 크기)
 * - type?: 'button' | 'submit' | 'reset' (버튼 타입)
 * - disabled?: boolean (비활성화 상태)
 * - className?: string (추가 CSS 클래스)
 * - onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void (클릭 핸들러)
 * - fullWidth?: boolean (전체 너비)
 * - icon?: React.ReactNode (아이콘)
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
  fullWidth = false,
  icon,
}) => {
  const buttonClasses = [
    'pethaul-btn',
    `pethaul-btn--${variant}`,
    `pethaul-btn--${size}`,
    fullWidth && 'pethaul-btn--full-width',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={buttonClasses} disabled={disabled} onClick={onClick}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  )
}

export default memo(Button)

