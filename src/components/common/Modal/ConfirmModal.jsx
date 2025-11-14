import PropTypes from 'prop-types'
import { Modal, Button } from '../index'

/**
 * 확인/취소 모달 컴포넌트
 * 
 * @example
 * <ConfirmModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleConfirm}
 *   title="삭제 확인"
 *   message="정말 삭제하시겠습니까?"
 *   confirmText="삭제"
 *   cancelText="취소"
 *   variant="danger"
 * />
 */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'primary',
  size = 'md',
}) {
  const handleConfirm = () => {
    onConfirm?.()
    onClose?.()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={variant} size="sm" onClick={handleConfirm}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
    </Modal>
  )
}

ConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger', 'warning', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
}

export default ConfirmModal

