import { useState, useCallback } from 'react'

/**
 * AlertModal을 쉽게 사용하기 위한 훅
 * 
 * @returns { isOpen, open, close }
 * 
 * @example
 * const { isOpen, open, close } = useAlertModal()
 * 
 * const handleSuccess = () => {
 *   open({
 *     title: '성공',
 *     message: '작업이 완료되었습니다.',
 *     variant: 'success'
 *   })
 * }
 */
export function useAlertModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState(null)

  const open = useCallback((options) => {
    setConfig(options)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setConfig(null)
  }, [])

  return {
    isOpen,
    open,
    close,
    config: config || {},
  }
}

