import { useEffect, useCallback, useRef } from 'react'

/**
 * 팝오버/드롭다운 화살표 위치 계산 훅
 * @param {boolean} isOpen - 열림 상태
 * @param {React.RefObject} anchorRef - 앵커 ref
 * @param {React.RefObject} contentRef - 콘텐츠 ref
 */
export function useArrowPosition(isOpen, anchorRef, contentRef) {
  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current
    const content = contentRef?.current
    if (!anchor || !content) return

    const iconBtn = anchor.querySelector('button, a, [role="button"]') || anchor
    const iconRect = iconBtn.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const arrowHalf = 6
    const iconCenterX = iconRect.left + iconRect.width / 2
    const rightPx = Math.max(8, contentRect.right - iconCenterX - arrowHalf)
    content.style.setProperty('--arrow-right', `${Math.round(rightPx)}px`)
  }, [anchorRef, contentRef])

  useEffect(() => {
    if (!isOpen) return

    updatePosition()
    const handleResize = () => updatePosition()
    const handleScroll = () => updatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [isOpen, updatePosition])
}





