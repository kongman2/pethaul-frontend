import { forwardRef, useMemo } from 'react'
import { createPortal } from 'react-dom'

import ItemSearchTap from './ItemSearchTap'

import './MenuDropdown.scss'

const MenuDropdown = forwardRef(function MenuDropdown(
   { variant = 'pc', items = [], onClose, title = 'MENU', className = '', ...rest },
   ref
) {
   const isMobile = variant === 'mob'
   const classNames = useMemo(() => {
      return ['menu-dropdown-wrap', isMobile ? 'is-mob' : 'is-pc', className].filter(Boolean).join(' ')
   }, [isMobile, className])

   const content = (
      <div
         ref={ref}
         className={classNames}
         role="menu"
         aria-label={rest['aria-label'] ?? 'Main menu'}
         {...rest}
      >
         {isMobile && (
            <div className="d-flex justify-content-between align-items-center mb-3">
               <h1 className="section-title mb-0">{title}</h1>
               <button type="button" className="menu-close-btn" onClick={onClose} aria-label="메뉴 닫기">
                  ✕
               </button>
            </div>
         )}

         <ItemSearchTap items={items} onClose={onClose} />
      </div>
   )

   if (isMobile && typeof document !== 'undefined') {
      return createPortal(content, document.body)
   }

   return content
})

export default MenuDropdown

