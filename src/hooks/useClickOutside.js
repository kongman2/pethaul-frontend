import { useEffect } from 'react'

/**
 * 바깥 클릭 감지 훅
 * @param {Function} handler - 바깥 클릭 시 실행할 함수
 * @param {Array} refs - 감지할 ref 배열
 */
export function useClickOutside(handler, refs = []) {
  useEffect(() => {
    if (!handler) return

    const handleClick = (e) => {
      const isInside = refs.some((ref) => {
        if (!ref) return false
        const element = ref.current || ref
        return element?.contains?.(e.target)
      })
      if (!isInside) {
        handler()
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [handler, refs])
}

