import { useCallback, useEffect, useRef } from 'react'
import { Icon } from '@iconify/react'

import './UserMenuPopover.scss'
export default function UserMenuPopover({
  open,
  onClose,
  anchorRef,
  variant = 'pc',
  isAuthenticated,
  isAdmin,
  isGoogleUser,
  user,
  onLogin,
  onJoin,
  onLogout,
  onGoMyPage,
  onGoAdmin,
  onCreateItem,
}) {
  const menuRef = useRef(null)

  const updateArrow = useCallback(() => {
    const anchor = anchorRef?.current
    const menuEl = menuRef.current
    if (!anchor || !menuEl) return
    const iconBtn = anchor.querySelector('button, a, [role="button"]') || anchor
    const iconRect = iconBtn.getBoundingClientRect()
    const menuRect = menuEl.getBoundingClientRect()
    const arrowHalf = 6
    const iconCenterX = iconRect.left + iconRect.width / 2
    const rightPx = Math.max(8, menuRect.right - iconCenterX - arrowHalf)
    menuEl.style.setProperty('--arrow-right', `${Math.round(rightPx)}px`)
  }, [anchorRef])

  useEffect(() => {
    if (!open) return
    // 포지션 보정
    const raf = requestAnimationFrame(updateArrow)

    const onResizeOrScroll = () => updateArrow()
    const onDown = (e) => {
      const inMenu = menuRef.current?.contains(e.target)
      const inAnchor = anchorRef?.current?.contains(e.target)
      if (!inMenu && !inAnchor) onClose?.()
    }

    window.addEventListener('resize', onResizeOrScroll)
    window.addEventListener('orientationchange', onResizeOrScroll)
    window.addEventListener('scroll', onResizeOrScroll, true)
    document.addEventListener('mousedown', onDown)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResizeOrScroll)
      window.removeEventListener('orientationchange', onResizeOrScroll)
      window.removeEventListener('scroll', onResizeOrScroll, true)
      document.removeEventListener('mousedown', onDown)
    }
  }, [open, updateArrow, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      className={`user-menu ${variant === 'mob' ? 'is-mob' : 'is-pc'}`}
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => { if (e.key === 'Escape') onClose?.() }}
    >
      <div className="user-menu__arrow" />

      <div className="user-menu__header">
        {isAuthenticated ? (
          <>
            <span className="user-menu__avatar" aria-hidden="true">
              <Icon icon="pixelarticons:user" width={24} height={24} />
            </span>
            <div className="user-menu__meta">
              <strong className="user-menu__name">{user?.nickname ?? user?.name ?? '사용자'}</strong>
              <span className="user-menu__role">{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
            </div>
          </>
        ) : (
          <span className="user-menu__welcome">어서오세요!</span>
        )}
      </div>

      <nav className="user-menu__list" role="menu" aria-label="User menu">
        {isAuthenticated ? (
          <>
            <button type="button" role="menuitem" className="user-menu__item" onClick={onGoMyPage}>
              <span className="user-menu__icon">
                <Icon icon="pixelarticons:home" width={20} height={20} />
              </span>
              마이페이지
            </button>

            {isAdmin && (
              <>
                <div className="user-menu__divider" />
                <button type="button" role="menuitem" className="user-menu__item" onClick={onGoAdmin}>
                  <span className="user-menu__icon">
                    <Icon icon="pixelarticons:settings" width={20} height={20} />
                  </span>
                  관리자 페이지
                </button>
                {!isGoogleUser && (
                  <button type="button" role="menuitem" className="user-menu__item" onClick={onCreateItem}>
                    <span className="user-menu__icon">
                      <Icon icon="pixelarticons:plus" width={20} height={20} />
                    </span>
                    상품 등록
                  </button>
                )}
              </>
            )}

            <div className="user-menu__divider" />
            <button type="button" role="menuitem" className="user-menu__item" onClick={onLogout}>
              <span className="user-menu__icon">
                <Icon icon="pixelarticons:logout" width={20} height={20} />
              </span>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button type="button" role="menuitem" className="user-menu__item" onClick={onLogin}>
              <span className="user-menu__icon">
                <Icon icon="pixelarticons:lock" width={20} height={20} />
              </span>
              로그인
            </button>
            <button type="button" role="menuitem" className="user-menu__item" onClick={onJoin}>
              <span className="user-menu__icon">
                <Icon icon="pixelarticons:user" width={20} height={20} />
              </span>
              회원가입
            </button>
          </>
        )}
      </nav>
    </div>
  )
}
