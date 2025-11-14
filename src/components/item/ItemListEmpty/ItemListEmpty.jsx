import PropTypes from 'prop-types'
import classNames from 'classnames'

function ItemListEmpty({ message, className, children }) {
  return (
    <div
      className={classNames(
        'alert alert-secondary text-center bg-transparent border-0 mb-0',
        className
      )}
      role="status"
    >
      {message}
      {children}
    </div>
  )
}

ItemListEmpty.propTypes = {
  message: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
}

export default ItemListEmpty
