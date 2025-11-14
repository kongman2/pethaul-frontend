import { useEffect } from 'react'
import { useAppBackgroundContext } from '../contexts/AppBackgroundContext.jsx'

export default function useAppBackground(targetClass, { autoReset = true } = {}) {
  const { background, setBackground, resetBackground } = useAppBackgroundContext()

  useEffect(() => {
    if (!targetClass) return undefined
    setBackground(targetClass)
    return () => {
      if (autoReset) {
        resetBackground()
      }
    }
  }, [targetClass, autoReset, setBackground, resetBackground])

  return { background, setBackground, resetBackground }
}


