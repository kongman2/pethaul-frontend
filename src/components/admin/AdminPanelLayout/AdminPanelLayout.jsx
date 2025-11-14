import PropTypes from 'prop-types'
import classNames from 'classnames'

function AdminPanelLayout({ title, actions, children, className }) {
  return (
    <section className={classNames('container py-4 d-flex flex-column', className)}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
        {title && <h4 className="admin-section-title mb-0">{title}</h4>}
        {actions && <div className="d-flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  )
}

AdminPanelLayout.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
}

export default AdminPanelLayout

