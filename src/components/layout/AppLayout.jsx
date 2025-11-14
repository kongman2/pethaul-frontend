import { Outlet } from 'react-router-dom'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './Navbar/Navbar'
import MobileTabBar from './MobileTabBar/MobileTabBar'
import Footer from './Footer/Footer'
import { AppBackgroundContext, DEFAULT_APP_BACKGROUND } from '../../contexts/AppBackgroundContext.jsx'

function AppLayout() {
  const [background, setBackgroundState] = useState(DEFAULT_APP_BACKGROUND)

  const setBackground = useCallback((value) => {
    setBackgroundState((prev) => (prev === value ? prev : value || DEFAULT_APP_BACKGROUND))
  }, [])

  const resetBackground = useCallback(() => {
    setBackgroundState(DEFAULT_APP_BACKGROUND)
  }, [])

  useEffect(() => {
    const mainEl = document.querySelector('.app-main')
    if (!mainEl) return

    const bgClasses = Array.from(mainEl.classList).filter((cls) => cls.startsWith('app-bg--'))
    bgClasses.forEach((cls) => mainEl.classList.remove(cls))
    if (background) {
      mainEl.classList.add(background)
    }

    return () => {
      const cleanupBgClasses = Array.from(mainEl.classList).filter((cls) => cls.startsWith('app-bg--'))
      cleanupBgClasses.forEach((cls) => mainEl.classList.remove(cls))
      mainEl.classList.add(DEFAULT_APP_BACKGROUND)
    }
  }, [background])

  const providerValue = useMemo(
    () => ({
      background,
      setBackground,
      resetBackground,
    }),
    [background, setBackground, resetBackground]
  )

  return (
    <>
      <Navbar />
      <AppBackgroundContext.Provider value={providerValue}>
        <main className="app-main app-bg--default">
          <div className="app-main__content">
            <Outlet />
          </div>
          <MobileTabBar />
          <Footer />
        </main>
      </AppBackgroundContext.Provider>
    </>
  )
}

export default AppLayout