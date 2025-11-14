import { useState, useCallback } from 'react'

/**
 * ConfirmModal을 쉽게 사용하기 위한 훅
 * 
 * @returns { isOpen, open, close, confirm }
 * 
 * @example
 * const { isOpen, open, confirm } = useConfirmModal()
 * 
 * const handleDelete = () => {
 *   open({
 *     title: '삭제 확인',
 *     message: '정말 삭제하시겠습니까?',
 *     onConfirm: () => {
 *       // 삭제 로직
 *     }
 *   })
 * }
 */
export function useConfirmModal() {
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

  const confirm = useCallback(() => {
    config?.onConfirm?.()
    close()
  }, [config, close])

  return {
    isOpen,
    open,
    close,
    confirm,
    config: config || {},
  }
}

