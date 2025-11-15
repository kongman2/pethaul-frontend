import { Icon } from '@iconify/react'
import { useCallback, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUserThunk } from '../../../features/authSlice'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { AlertModal, ConfirmModal } from '../../common'
import UserMenuPopover from '../UserMenuPopover/UserMenuPopover'
import './MobileTabBar.scss'

export default function MobileTabBar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((s) => s.auth)
  const isGoogleUser = user?.provider === 'google'
  const isAdmin = user?.role === 'ADMIN'
  const { alert, confirm, alertModal, confirmModal } = useModalHelpers()

  // 모바일 유저 메뉴
  const [userOpen, setUserOpen] = useState(false)
  const userAnchorRef = useRef(null)
  const toggleUser = () => setUserOpen((v) => !v)
  const closeUser = useCallback(() => setUserOpen(false), [])

  const handleLogout = () => {
    confirm('로그아웃하시겠습니까?', () => {
      dispatch(logoutUserThunk())
      closeUser()
      alert('성공적으로 로그아웃했습니다.', '완료', 'success')
      navigate('/')
    }, '로그아웃 확인', '로그아웃', '취소', 'primary')
  }

  return (
    <nav className="m-tabbar" aria-label="모바일 하단 탭바">
      {/* 홈 */}
      <NavLink to="/" className="m-tab" aria-label="홈">
        <span className="m-tab__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 32 32">
            <path fill="#000" d="M6.855 13.71v-1.52h1.53v-1.52h1.52V9.14h1.52V7.62h1.53V6.1h1.52V4.57h3.05V6.1h1.52v1.52h1.53v1.52h1.52v1.53h1.52v1.52h1.53v1.52h1.52v16.77h1.53V16.76h1.52v-1.52h1.52v-1.53h-1.52v-1.52h-1.52v-1.52h-1.53V9.14h-1.52V7.62h-1.53V6.1h-1.52V4.57h-1.52V3.05h-1.53V1.52h-1.52V0h-3.05v1.52h-1.52v1.53h-1.53v1.52h-1.52V6.1h-1.52v1.52h-1.53v1.52h-1.52v1.53h-1.52v1.52h-1.53v1.52H.765v1.53h1.52v1.52h1.53v13.72h1.52V13.71z"></path>
            <path fill="#000" d="M26.665 32v-1.52h-6.09V18.29h-1.53v12.19h-6.09V18.29h-1.53v12.19h-6.09V32z"></path>
            <path fill="#000" d="M22.095 19.81h3.05v3.05h-3.05Zm-4.57-10.67h1.52v3.05h-1.52Zm-3.05-1.52h3.05v1.52h-3.05Zm0 15.24h1.53v1.52h-1.53Zm-1.52-6.1h6.09v1.53h-6.09Zm1.52-4.57h3.05v1.52h-3.05Z"></path>
            <path fill="#000" d="M12.955 9.14h1.52v3.05h-1.52Zm-6.1 10.67h3.05v3.05h-3.05Z"></path>
          </svg>
        </span>
        <span className="m-tab__label">홈</span>
      </NavLink>

      {/* 좋아요 */}
      {!isAdmin && (
        <NavLink to="/likes/item" className="m-tab" aria-label="좋아요">
          <span className="m-tab__icon">
            <Icon icon="pixelarticons:heart" width={26} height={26} />
          </span>
          <span className="m-tab__label">좋아요</span>
        </NavLink>
      )}

      {/* 컨텐츠 (TODO: 실제 링크로 교체) */}
      <NavLink to="/contents" className="m-tab" aria-label="컨텐츠">
        <span className="m-tab__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 32 32">
            <path fill="#000" d="M30.48 4.57H32v24.38h-1.52Zm-1.53 24.38h1.53v1.53h-1.53Zm0-25.9h1.53v1.52h-1.53ZM3.05 30.48h25.9V32H3.05Zm3.05-6.1h19.81v1.53H6.1Zm0-6.09h19.81v1.52H6.1Zm12.19-6.1h7.62v1.52h-7.62Zm0-4.57h7.62v1.52h-7.62Z"></path>
            <path fill="#000" d="M7.62 3.05v10.66h1.52v-1.52h1.53v-1.52h1.52v1.52h1.52v1.52h1.53V3.05h13.71V1.52H13.71V0H4.57v1.52H1.52v1.53Zm3.05-1.53h1.52v1.53h1.52V6.1h-1.52V3.05h-1.52ZM1.52 28.95h1.53v1.53H1.52ZM0 3.05h1.52v25.9H0Z"></path>
        </svg>
        </span>
        <span className="m-tab__label">컨텐츠</span>
      </NavLink>

      {/* 장바구니 */}
      {!isAdmin && (
        <NavLink to="/cart" className="m-tab" aria-label="장바구니">
          <span className="m-tab__icon">
            <Icon icon="streamline-pixel:shopping-shipping-basket" width={24} height={24} />
          </span>
          <span className="m-tab__label">장바구니</span>
        </NavLink>
      )}

      {/* 마이 (버튼 + 팝오버) */}
      <div className="m-tab" aria-label="마이" ref={userAnchorRef}>
        <button
          type="button"
          className="m-tab__btn"
          onClick={toggleUser}
          aria-expanded={userOpen}
          aria-haspopup="dialog"
        >
          <span className="m-tab__icon">
            <Icon icon="streamline-pixel:user-single-aim" width={24} height={24} />
          </span>
          <span className="m-tab__label">마이</span>
        </button>

        <UserMenuPopover
          open={userOpen}
          onClose={closeUser}
          anchorRef={userAnchorRef}
          variant="mob"
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          isGoogleUser={isGoogleUser}
          user={user}
          onLogin={() => { closeUser(); navigate('/login') }}
          onJoin={() => { closeUser(); navigate('/join') }}
          onLogout={handleLogout}
          onGoMyPage={() => { closeUser(); navigate('/mypage') }}
          onGoAdmin={() => { closeUser(); navigate('/admin') }}
          onCreateItem={() => { closeUser(); navigate('/items/create') }}
        />
      </div>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
      <ConfirmModal
        open={confirmModal.isOpen}
        onClose={confirmModal.close}
        onConfirm={confirmModal.confirm}
        title={confirmModal.config.title}
        message={confirmModal.config.message}
        confirmText={confirmModal.config.confirmText}
        cancelText={confirmModal.config.cancelText}
        variant={confirmModal.config.variant}
      />
    </nav>
  )
}
