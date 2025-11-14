import PropTypes from 'prop-types'
import { Icon } from '@iconify/react'

import { Button, Modal } from '../../common'
import './CouponModal.scss'

function CouponModal({ open, coupons, selectedCoupon, onSelect, onClear, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="쿠폰 선택"
      footer={
        <div className="coupon-modal__footer-actions">
          <Button variant="ghost" size="sm" onClick={onClose}>
            닫기
          </Button>
          {selectedCoupon && (
            <Button variant="outline" size="sm" onClick={onClear}>
              선택 해제
            </Button>
          )}
        </div>
      }
    >
      <div className="coupon-modal__list">
        {coupons.length === 0 ? (
          <p className="coupon-modal__empty">사용 가능한 쿠폰이 없습니다.</p>
        ) : (
          coupons.map((coupon) => {
            const isActive = selectedCoupon?.code === coupon.code

            return (
              <button
                key={coupon.code}
                type="button"
                className={`coupon-modal__item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  onSelect(coupon)
                  onClose()
                }}
              >
                <div className="coupon-modal__item-info">
                  <span className="coupon-modal__item-name">{coupon.name}</span>
                  <span className="coupon-modal__item-code">코드: {coupon.code}</span>
                </div>
                {isActive ? (
                  <Icon icon="lucide:check" width={20} height={20} />
                ) : (
                  <Icon icon="lucide:plus" width={20} height={20} />
                )}
              </button>
            )
          })
        )}
      </div>
    </Modal>
  )
}

CouponModal.propTypes = {
  open: PropTypes.bool,
  coupons: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string,
      value: PropTypes.number,
    }),
  ),
  selectedCoupon: PropTypes.shape({
    code: PropTypes.string,
  }),
  onSelect: PropTypes.func,
  onClear: PropTypes.func,
  onClose: PropTypes.func,
}

export default CouponModal

