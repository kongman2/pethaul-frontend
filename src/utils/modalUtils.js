/**
 * alert/confirm을 모달로 대체하기 위한 유틸리티
 * useAlertModal과 useConfirmModal을 쉽게 사용할 수 있도록 도와주는 함수들
 */

/**
 * alert를 AlertModal로 대체하는 헬퍼
 * @param {Object} alertModal - useAlertModal() 훅의 반환값
 * @param {string} message - 알림 메시지
 * @param {string} title - 제목 (기본값: '알림')
 * @param {string} variant - variant (기본값: 'info')
 */
export const showAlert = (alertModal, message, title = '알림', variant = 'info') => {
  alertModal.open({
    title,
    message,
    variant,
  })
}

/**
 * confirm을 ConfirmModal로 대체하는 헬퍼
 * @param {Object} confirmModal - useConfirmModal() 훅의 반환값
 * @param {string} message - 확인 메시지
 * @param {Function} onConfirm - 확인 시 실행할 함수
 * @param {string} title - 제목 (기본값: '확인')
 * @param {string} confirmText - 확인 버튼 텍스트 (기본값: '확인')
 * @param {string} cancelText - 취소 버튼 텍스트 (기본값: '취소')
 * @param {string} variant - variant (기본값: 'primary')
 */
export const showConfirm = (
  confirmModal,
  message,
  onConfirm,
  title = '확인',
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary'
) => {
  confirmModal.open({
    title,
    message,
    confirmText,
    cancelText,
    variant,
    onConfirm,
  })
}

