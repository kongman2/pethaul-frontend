import PropTypes from 'prop-types'
import { Modal, Button } from '../index'

/**
 * 알림 모달 컴포넌트
 * 
 * @example
 * <AlertModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="알림"
 *   message="작업이 완료되었습니다."
 *   variant="success"
 * />
 */
function AlertModal({
  open,
  onClose,
  title = '알림',
  message,
  buttonText = '확인',
  variant = 'primary',
  size = 'md',
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <Button variant={variant} size="sm" onClick={onClose}>
          {buttonText}
        </Button>
      }
    >
      <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{message}</p>
    </Modal>
  )
}

AlertModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'danger', 'warning', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
}

export default AlertModal

