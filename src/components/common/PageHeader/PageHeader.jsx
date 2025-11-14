import { Icon } from '@iconify/react'

import Button from '../Button'

import './PageHeader.scss'

function PageHeader({
  title,
  description,
  onBack,
  backLabel = '이전 페이지',
  actions = null,
  className = '',
  titleClassName = '',
  headingLevel = 'h1',
}) {
  const HeadingTag = headingLevel
  const showBack = typeof onBack === 'function'

  const containerClasses = [
    'page-header',
    'd-flex',
    'flex-wrap',
    'align-items-center',
    'justify-content-between',
    'gap-3',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const headingClasses = ['section-title', 'mb-0', titleClassName].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      <div className="page-header__title">
        <HeadingTag className={headingClasses}>{title}</HeadingTag>
        {description && <p className="page-header__description text-muted mb-0">{description}</p>}
      </div>
      {(showBack || actions) && (
        <div className="page-header__actions d-flex flex-wrap align-items-center justify-content-end gap-2">
          {actions}
          {showBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <Icon icon="lucide:chevron-left" width={16} height={16} />
              {backLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default PageHeader

