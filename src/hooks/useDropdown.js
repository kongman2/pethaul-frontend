import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * 드롭다운 상태 관리 훅
 * @param {Object} options
 * @param {number} options.breakpoint - 브레이크포인트 (기본: 768)
 * @param {Function} options.onClose - 닫을 때 호출할 함수들
 */
export function useDropdown({ breakpoint = 768, onClose = [] } = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [owner, setOwner] = useState(null) // 'pc' | 'mob' | null
  const anchorRef = useRef(null)
  const contentRef = useRef(null)
  const stateRef = useRef({ isOpen: false, owner: null })

  // 상태 ref 동기화
  useEffect(() => {
    stateRef.current = { isOpen, owner }
  }, [isOpen, owner])

  const open = useCallback((newOwner) => {
    // 다른 드롭다운들 닫기
    onClose.forEach((closeFn) => closeFn?.())
    
    const current = stateRef.current
    // 같은 owner로 다시 클릭하면 토글
    if (current.owner === newOwner && current.isOpen) {
      setIsOpen(false)
      setOwner(null)
      return
    }
    
    // 새로운 owner로 열기
    setOwner(newOwner)
    setIsOpen(true)
  }, [onClose])

  const close = useCallback(() => {
    setIsOpen(false)
    setOwner(null)
  }, [])

  // 브레이크포인트 변경 시 자동 닫기
  useEffect(() => {
    if (!isOpen) return
    const handleResize = () => {
      const isDesktop = window.innerWidth >= breakpoint
      if ((owner === 'mob' && isDesktop) || (owner === 'pc' && !isDesktop)) {
        close()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isOpen, owner, breakpoint, close])

  return {
    isOpen,
    owner,
    anchorRef,
    contentRef,
    open,
    close,
  }
}

