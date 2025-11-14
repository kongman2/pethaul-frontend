import PropTypes from 'prop-types'
import { Spinner } from '../../common'

function ItemListLoading({ message = '상품을 불러오는 중입니다...', className }) {
  return (
    <div className={className}>
      <Spinner text={message} />
    </div>
  )
}

ItemListLoading.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
}

export default ItemListLoading
