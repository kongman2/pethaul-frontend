/**
 * alert/confirm을 모달로 쉽게 사용하기 위한 커스텀 훅
 */
import { useAlertModal } from './useAlertModal'
import { useConfirmModal } from './useConfirmModal'

/**
 * alert와 confirm을 쉽게 사용할 수 있게 해주는 훅
 * @returns {Object} { alert, confirm, alertModal, confirmModal }
 */
export function useModalHelpers() {
  const alertModal = useAlertModal()
  const confirmModal = useConfirmModal()

  /**
   * alert를 모달로 표시
   * @param {string} message - 알림 메시지
   * @param {string} title - 제목 (기본값: '알림')
   * @param {string} variant - variant (기본값: 'info')
   */
  const alert = (message, title = '알림', variant = 'info') => {
    alertModal.open({
      title,
      message,
      variant,
    })
  }

  /**
   * confirm을 모달로 표시
   * @param {string} message - 확인 메시지
   * @param {Function} onConfirm - 확인 시 실행할 함수
   * @param {string} title - 제목 (기본값: '확인')
   * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
   * @param {string} cancelText - 취소 버튼 텍스트 (기본값: '취소')
   * @param {string} variant - variant (기본값: 'primary')
   */
  const confirm = (message, onConfirm, title = '확인', confirmText = '확인', cancelText = '취소', variant = 'primary') => {
    confirmModal.open({
      title,
      message,
      confirmText,
      cancelText,
      variant,
      onConfirm,
    })
  }

  return {
    alert,
    confirm,
    alertModal,
    confirmModal,
  }
}

