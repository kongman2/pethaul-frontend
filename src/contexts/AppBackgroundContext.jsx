import { createContext, useContext } from 'react'

export const DEFAULT_APP_BACKGROUND = 'app-bg--default'

export const AppBackgroundContext = createContext({
  background: DEFAULT_APP_BACKGROUND,
  setBackground: () => {},
  resetBackground: () => {},
})

export const useAppBackgroundContext = () => useContext(AppBackgroundContext)


