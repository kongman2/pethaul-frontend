import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { Icon } from '@iconify/react'

import './Modal.scss'

const modalRoot = typeof document !== 'undefined' ? document.body : null

function Modal({ 
  open, 
  onClose, 
  title, 
  children, 
  footer, 
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop = true,
  showCloseButton = true,
  bodyClassName = '',
  headerClassName = '',
  footerClassName = '',
  onBackdropClick, // 커스텀 backdrop 클릭 핸들러
}) {
  // body 스크롤 잠금
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open || !modalRoot) {
    return null
  }

  const handleBackdropClick = (e) => {
    if (e.target !== e.currentTarget) return
    
    if (onBackdropClick) {
      onBackdropClick(e)
    } else if (closeOnBackdrop) {
      onClose?.()
    }
  }

  return createPortal(
    <div 
      className="pethaul-modal-backdrop" 
      role="dialog" 
      aria-modal="true" 
      onClick={handleBackdropClick}
    >
      <div
        className={`pethaul-modal pethaul-modal--${size} ${className}`.trim()}
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        {(title || (onClose && showCloseButton)) && (
          <div className={`pethaul-modal__header ${headerClassName}`.trim()}>
            {title && <h2 className="pethaul-modal__title">{title}</h2>}
            {onClose && showCloseButton && (
              <button type="button" className="pethaul-modal__close" onClick={onClose} aria-label="닫기">
                <Icon icon="lucide:x" width={20} height={20} />
              </button>
            )}
          </div>
        )}

        <div className={`pethaul-modal__body ${bodyClassName}`.trim()}>{children}</div>

        {footer && <div className={`pethaul-modal__footer ${footerClassName}`.trim()}>{footer}</div>}
      </div>
    </div>,
    modalRoot,
  )
}

Modal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  closeOnBackdrop: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  bodyClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  onBackdropClick: PropTypes.func,
}

export default Modal

