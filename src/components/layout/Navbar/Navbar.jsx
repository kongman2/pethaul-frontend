import { useEffect, useState, useCallback, useRef } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Icon } from '@iconify/react'

import { logoutUserThunk } from '../../../features/authSlice'
import { useModalHelpers } from '../../../hooks/useModalHelpers'
import { throttle } from '../../../utils/performanceUtils'

import { AlertModal, ConfirmModal } from '../../common'
import UserMenuPopover from '../UserMenuPopover/UserMenuPopover'
import MenuDropdown from '../MenuDropdown/MenuDropdown'

import './Navbar.scss'

function Navbar() {
   const dispatch = useDispatch()
   const navigate = useNavigate()
   const location = useLocation()
   const { isAuthenticated, user } = useSelector((s) => s.auth)
   const { alert, confirm, alertModal, confirmModal } = useModalHelpers()
   const items = useSelector((s) => s.item.list ?? s.item.items ?? [], shallowEqual)
   const isGoogleUser = user?.provider === 'google'
   const isAdmin = user?.role === 'ADMIN'

   const BREAKPOINT = 768

   // -----------------------------
   // 검색 말풍선
   // -----------------------------
   const [searchOpen, setSearchOpen] = useState(false)
   const [searchOwner, setSearchOwner] = useState(null) // 'pc' | 'mob' | null
   const [query, setQuery] = useState('')

   const pcAnchorRef = useRef(null)
   const mobAnchorRef = useRef(null)
   const searchBubbleRef = useRef(null)

   const openSearchAt = (owner) => {
      closeMenu()
      closeUserMenu()
      setSearchOwner(owner)
      setSearchOpen((prev) => (owner === searchOwner ? !prev : true))
   }
   const closeSearch = useCallback(() => {
      setSearchOpen(false)
      setSearchOwner(null)
   }, [])

   const updateSearchArrow = useCallback(() => {
      const anchor = searchOwner === 'pc' ? pcAnchorRef.current : mobAnchorRef.current
      const bubble = searchBubbleRef.current
      if (!anchor || !bubble) return
      const iconBtn = anchor.querySelector('button, [role="button"]')
      if (!iconBtn) return

      const iconRect = iconBtn.getBoundingClientRect()
      const bubbleRect = bubble.getBoundingClientRect()
      const arrowHalf = 6
      const iconCenterX = iconRect.left + iconRect.width / 2
      const rightPx = Math.max(8, bubbleRect.right - iconCenterX - arrowHalf)
      bubble.style.setProperty('--arrow-right', `${Math.round(rightPx)}px`)
   }, [searchOwner])

   // -----------------------------
   // 유저 메뉴 (팝오버 컴포넌트 사용)
   // -----------------------------
   const [userMenuOpen, setUserMenuOpen] = useState(false)
   const userAnchorRef = useRef(null)
   const openUserMenu = () => {
      closeMenu()
      closeSearch()
      setUserMenuOpen((v) => !v)
   }
   const closeUserMenu = useCallback(() => setUserMenuOpen(false), [])

   // -----------------------------
   // 메인 MENU 드롭다운 (PC/Mobile 공용)
   // -----------------------------
   const [menuOpen, setMenuOpen] = useState(false)
   const [menuOwner, setMenuOwner] = useState(null) // 'pc' | 'mob' | null
   const pcMenuAnchorRef = useRef(null)
   const mobMenuAnchorRef = useRef(null)
   const menuRef = useRef(null)

   const openMenuAt = (owner) => {
      closeSearch()
      closeUserMenu()
      setMenuOwner(owner)
      setMenuOpen((prev) => (owner === menuOwner ? !prev : true))
   }
   const closeMenu = useCallback(() => {
      setMenuOpen(false)
      setMenuOwner(null)
   }, [])

   const updateMenuArrow = useCallback(() => {
      const anchor = menuOwner === 'pc' ? pcMenuAnchorRef.current : menuOwner === 'mob' ? mobMenuAnchorRef.current : null
      const menuEl = menuRef.current
      if (!anchor || !menuEl) return
      const iconBtn = anchor.querySelector('a, button, [role="button"]') || anchor
      const iconRect = iconBtn.getBoundingClientRect()
      const menuRect = menuEl.getBoundingClientRect()
      const arrowHalf = 6
      const iconCenterX = iconRect.left + iconRect.width / 2
      const rightPx = Math.max(8, menuRect.right - iconCenterX - arrowHalf)
      menuEl.style.setProperty('--arrow-right', `${Math.round(rightPx)}px`)
   }, [menuOwner])

   // -----------------------------
   // 공통: 리사이즈/스크롤/바깥클릭 + 브레이크포인트 동기화
   // -----------------------------
   useEffect(() => {
      // 메뉴/검색이 열려있을 때만 화살표 업데이트
      if (searchOpen) requestAnimationFrame(updateSearchArrow)
      if (menuOpen) requestAnimationFrame(updateMenuArrow)
   }, [searchOpen, menuOpen, updateSearchArrow, updateMenuArrow])

   // throttle된 핸들러를 ref로 저장 (이벤트 리스너 제거를 위해)
   const resizeHandlerRef = useRef(null)
   const scrollHandlerRef = useRef(null)

   useEffect(() => {
      const syncByBreakpoint = () => {
         const w = window.innerWidth
         const isDesktop = w >= BREAKPOINT
         const isMobile = !isDesktop
         if (menuOpen && menuOwner === 'mob' && isDesktop) closeMenu()
         if (menuOpen && menuOwner === 'pc' && isMobile) closeMenu()
      }

      // resize 핸들러 생성 및 저장
      const handleResize = () => {
         syncByBreakpoint()
         if (searchOpen) requestAnimationFrame(updateSearchArrow)
         if (menuOpen) requestAnimationFrame(updateMenuArrow)
      }
      resizeHandlerRef.current = throttle(handleResize, 150)

      // scroll 핸들러 생성 및 저장 (메뉴/검색이 열려있을 때만 실행)
      const handleScroll = () => {
         if (searchOpen) requestAnimationFrame(updateSearchArrow)
         if (menuOpen) requestAnimationFrame(updateMenuArrow)
      }
      scrollHandlerRef.current = throttle(handleScroll, 100)

      const onDown = (e) => {
         // 검색
         const sB = searchBubbleRef.current
         const pcA = pcAnchorRef.current
         const mobA = mobAnchorRef.current
         const inSearch = sB?.contains(e.target) || pcA?.contains(e.target) || mobA?.contains(e.target)
         if (!inSearch) closeSearch()

         // 메뉴 (PC/Mob 공용)
         const mPcA = pcMenuAnchorRef.current
         const mMobA = mobMenuAnchorRef.current
         const mM = menuRef.current
         const inMenu = mM?.contains(e.target) || mPcA?.contains(e.target) || mMobA?.contains(e.target)
         if (!inMenu) closeMenu()
         // 유저 메뉴는 UserMenuPopover 내부에서 바깥클릭 처리
      }

      // 초기 브레이크포인트 체크
      syncByBreakpoint()

      window.addEventListener('resize', resizeHandlerRef.current)
      window.addEventListener('orientationchange', resizeHandlerRef.current)
      // 스크롤 이벤트는 passive 옵션 사용 (성능 향상)
      window.addEventListener('scroll', scrollHandlerRef.current, { passive: true })
      document.addEventListener('mousedown', onDown)
      return () => {
         if (resizeHandlerRef.current) {
            window.removeEventListener('resize', resizeHandlerRef.current)
            window.removeEventListener('orientationchange', resizeHandlerRef.current)
         }
         if (scrollHandlerRef.current) {
            window.removeEventListener('scroll', scrollHandlerRef.current, { passive: true })
         }
         document.removeEventListener('mousedown', onDown)
      }
   }, [BREAKPOINT, searchOpen, menuOpen, menuOwner, closeSearch, closeMenu, updateSearchArrow, updateMenuArrow])

   useEffect(() => {
      closeMenu()
      closeSearch()
      closeUserMenu()
   }, [location.pathname, location.search, closeMenu, closeSearch, closeUserMenu])

   // -----------------------------
   // 액션
   // -----------------------------
   const submitSearch = () => {
      const q = query.trim()
      if (!q) return
      navigate(`/items/search?keyword=${q}`)
      setQuery('')
      closeSearch()
   }

   const handleLogin = () => {
      navigate('/login')
      closeUserMenu()
   }
   const handleJoin = () => {
      navigate('/join')
      closeUserMenu()
   }
   const handleLogout = () => {
      confirm('로그아웃하시겠습니까?', () => {
         dispatch(logoutUserThunk())
         closeUserMenu()
         alert('성공적으로 로그아웃했습니다.', '완료', 'success')
         navigate('/')
      }, '로그아웃 확인', '로그아웃', '취소', 'primary')
   }

   return (
      <header className="navbar navbar-expand-lg bg-transparent fixed-top w-100 shadow-sm">
         <div className="container">
            <section id="navbar-section" className="d-flex align-items-center justify-content-between w-100">
               {/* 로고 */}
               <NavLink to="/" className="galindo logo">
                  PETHAUL
               </NavLink>

               {/* 상단 메뉴 */}
               <ul className="navbar-nav flex-row gap-3">
                  {/* ▼ MENU 드롭다운 (PC 앵커) */}
                  <li className="nav-item" ref={pcMenuAnchorRef}>
                     <button
                        type="button"
                        onClick={(e) => {
                           e.preventDefault()
                           openMenuAt('pc')
                        }}
                        aria-expanded={menuOpen && menuOwner === 'pc'}
                        aria-haspopup="menu"
                     >
                        MENU
                     </button>

                     {/* PC 드롭다운 */}
                     {menuOpen && menuOwner === 'pc' && (
                        <MenuDropdown
                           ref={menuRef}
                           variant="pc"
                           items={items}
                           onClose={closeMenu}
                           onKeyDown={(e) => {
                              if (e.key === 'Escape') closeMenu()
                           }}
                        />
                     )}
                  </li>

                  <li>
                     <NavLink to="/items/search?filter=시즌">
                        SEASON
                        <Icon icon="fluent-emoji-flat:chestnut" width={16} height={16} />
                     </NavLink>
                  </li>
                  <li>
                     <NavLink to="/items/search?filter=이벤트&filter=세일">
                        SALE EVENT
                        <Icon icon="fluent-emoji:star" width={16} height={16} />
                     </NavLink>
                  </li>
               </ul>

               {/* 우측 아이콘 바 */}
                  <div className="right-icon-bar d-flex align-items-center gap-3">
                  {/* 🔎 PC 검색 앵커 */}
                  <div className="search-anchor pc-search-icon search" ref={pcAnchorRef}>
                     <button type="button" className="btn btn-link p-0" onClick={() => openSearchAt('pc')} aria-expanded={searchOpen && searchOwner === 'pc'} aria-haspopup="dialog" aria-label="검색">
                        <Icon icon="pixelarticons:search" width={24} height={24} />
                     </button>

                     {searchOpen && searchOwner === 'pc' && (
                        <div
                           className="search-bubble"
                           ref={searchBubbleRef}
                           role="dialog"
                           aria-modal="true"
                           onKeyDown={(e) => {
                              if (e.key === 'Escape') closeSearch()
                              if (e.key === 'Enter') submitSearch()
                           }}
                        >
                           <input type="text" className="search-input" placeholder="검색어를 입력하세요" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus onFocus={updateSearchArrow} />
                           <button type="button" className="search-submit" onClick={submitSearch}>
                              <Icon icon="pixelarticons:arrow-right" width={18} height={18} />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* icon: search Mobile 검색 앵커 */}
                  <div className="search-anchor mob-search-icon search" ref={mobAnchorRef}>
                     <button type="button" className="btn btn-link p-0" onClick={() => openSearchAt('mob')} aria-expanded={searchOpen && searchOwner === 'mob'} aria-haspopup="dialog" aria-label="검색">
                        <Icon icon="pixelarticons:search" width={28} height={28} />
                     </button>

                     {searchOpen && searchOwner === 'mob' && (
                        <div
                           className="search-bubble"
                           ref={searchBubbleRef}
                           role="dialog"
                           aria-modal="true"
                           onKeyDown={(e) => {
                              if (e.key === 'Escape') closeSearch()
                              if (e.key === 'Enter') submitSearch()
                           }}
                        >
                           <input type="text" className="search-input" placeholder="검색어를 입력하세요" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus onFocus={updateSearchArrow} />
                           <button type="button" className="search-submit" onClick={submitSearch}>
                              <Icon icon="pixelarticons:arrow-right" width={18} height={18} />
                           </button>
                        </div>
                     )}
                  </div>

                  {/* icon: heart, shopping-shipping-basket */}
                  {!isAdmin && (
                     <div className="icon d-none d-md-flex align-items-center gap-2">
                        <button type="button" className="btn btn-link p-0" onClick={() => navigate('/likes/item')}>
                           <Icon icon="pixelarticons:heart" width={24} height={24} />
                        </button>
                        <button type="button" className="btn btn-link p-0" onClick={() => navigate('/cart')}>
                           <Icon icon="streamline-pixel:shopping-shipping-basket" width={24} height={24} />
                        </button>
                     </div>
                  )}
                  {/* icon: user-single-aim */}
                  <div className="user-anchor" ref={userAnchorRef}>
                     <button type="button" className="btn btn-link p-0" onClick={openUserMenu} aria-expanded={userMenuOpen} aria-haspopup="dialog" aria-label="유저 메뉴">
                        <Icon icon="streamline-pixel:user-single-aim" width={24} height={24} />
                     </button>

                     <UserMenuPopover
                        open={userMenuOpen}
                        onClose={closeUserMenu}
                        anchorRef={userAnchorRef}
                        variant="pc"
                        isAuthenticated={isAuthenticated}
                        isAdmin={isAdmin}
                        isGoogleUser={isGoogleUser}
                        user={user}
                        onLogin={handleLogin}
                        onJoin={handleJoin}
                        onLogout={handleLogout}
                        onGoMyPage={() => {
                           closeUserMenu()
                           navigate('/mypage')
                        }}
                        onGoAdmin={() => {
                           closeUserMenu()
                           navigate('/admin')
                        }}
                        onCreateItem={() => {
                           closeUserMenu()
                           navigate('/items/create')
                        }}
                     />
                  </div>

                  {/* icon: interface-essential-navigation-menu-3 */}
                  <div className="mobile-menu" ref={mobMenuAnchorRef} onClick={() => openMenuAt('mob')} aria-expanded={menuOpen && menuOwner === 'mob'} aria-haspopup="menu">
                     <Icon icon="streamline-pixel:interface-essential-navigation-menu-3" width={35} height={35} />
                  </div>

                  {/* MenuDropdown: 모바일 드롭다운 */}
                  {menuOpen && menuOwner === 'mob' && (
                     <MenuDropdown
                        ref={menuRef}
                        variant="mob"
                        items={items}
                        onClose={closeMenu}
                        onKeyDown={(e) => {
                           if (e.key === 'Escape') closeMenu()
                        }}
                     />
                  )}
               </div>
            </section>
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
      </header>
   )
}

export default Navbar