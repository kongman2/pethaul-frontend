import { useCallback, useState } from 'react'

/**
 * 모달/드롭다운 open/close/toggle 공용 훅

 
 * @param {boolean} initial - 초기 상태 (기본: false)
 * @returns { isOpen, open, close, toggle }
 * 
 * @example
 * const { isOpen, open, close, toggle } = useDisclosure()
 */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  return { isOpen, open, close, toggle }
}

