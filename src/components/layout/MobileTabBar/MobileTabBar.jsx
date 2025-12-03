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
          <Icon icon="streamline-pixel:interface-essential-home-1" width={26} height={26} style={{ display: 'inline-block' }} />
        </span>
        <span className="m-tab__label">홈</span>
      </NavLink>

      {/* 좋아요 */}
      {!isAdmin && (
      <NavLink to="/likes/item" className="m-tab" aria-label="좋아요">
        <span className="m-tab__icon">
          <Icon icon="pixelarticons:heart" width={26} height={26} style={{ display: 'inline-block' }} />
        </span>
        <span className="m-tab__label">좋아요</span>
      </NavLink>
      )}

      {/* 컨텐츠 (TODO: 실제 링크로 교체) */}
      <NavLink to="/contents" className="m-tab" aria-label="컨텐츠">
        <span className="m-tab__icon">
          <Icon icon="streamline-pixel:content-files-newspaper" width={24} height={24} style={{ display: 'inline-block' }} />
        </span>
        <span className="m-tab__label">컨텐츠</span>
      </NavLink>

      {/* 장바구니 */}
      {!isAdmin && (
      <NavLink to="/cart" className="m-tab" aria-label="장바구니">
        <span className="m-tab__icon">
          <Icon icon="streamline-pixel:shopping-shipping-basket" width={24} height={24} style={{ display: 'inline-block' }} />
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
            <Icon icon="streamline-pixel:user-single-aim" width={24} height={24} style={{ display: 'inline-block' }} />
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
