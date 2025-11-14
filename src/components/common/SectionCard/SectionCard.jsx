import PropTypes from 'prop-types'

import './SectionCard.scss'

/**
 * SectionCard Props
 * - children: React.ReactNode (카드 내용)
 * - title?: string | React.ReactNode (헤더 제목)
 * - showWindowBtn?: boolean (윈도우 버튼 표시 여부, 기본 true)
 * - headerActions?: React.ReactNode (헤더 우측 액션 영역)
 * - customHeader?: React.ReactNode (헤더 전체를 직접 전달하고 싶을 때)
 * - className?: string (추가 클래스)
 * - bodyClassName?: string (body에 추가할 클래스)
 * - variant?: 'default' | 'item' | string (필요 시 변형 클래스 지정)
 * - onClick?: () => void (카드 클릭 핸들러)
 * - collapsible?: boolean (body를 접을 수 있는지 여부, 기본 false)
 * - isOpen?: boolean (collapsible일 때 열림 상태, 기본 false)
 */
function SectionCard({
  children,
  title,
  showWindowBtn = true,
  headerActions,
  customHeader,
  className = '',
  bodyClassName = '',
  variant = 'default',
  onClick,
  collapsible = false,
  isOpen = false,
}) {
  const cardClasses = ['section-card']
  if (variant && variant !== 'default') cardClasses.push(`section-card--${variant}`)
  if (className) cardClasses.push(className)
  if (collapsible) cardClasses.push('section-card--collapsible')
  if (collapsible && isOpen) cardClasses.push('section-card--open')

  const hasHeader = Boolean(customHeader || title || showWindowBtn || headerActions)
  const hasBody = (!collapsible || isOpen) && Boolean(children)
  
  // body가 없을 때 클래스 추가
  if (!hasBody) cardClasses.push('section-card--no-body')

  return (
    <div className={cardClasses.join(' ')} onClick={onClick}>
      {hasHeader && (
        <div className="section-card__header">
          {customHeader ? (
            customHeader
          ) : (
            <>
              {showWindowBtn && (
                <div className="section-card__window-btn">
                  <span className="red" />
                  <span className="green" />
                  <span className="blue" />
                </div>
              )}
              {title && <span className="section-card__title">{title}</span>}
              {headerActions && <div className="section-card__header-actions">{headerActions}</div>}
            </>
          )}
        </div>
      )}

      {hasBody && (
        <div className={`section-card__body ${bodyClassName}`.trim()}>{children}</div>
      )}
    </div>
  )
}

SectionCard.propTypes = {
  children: PropTypes.node,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  showWindowBtn: PropTypes.bool,
  headerActions: PropTypes.node,
  customHeader: PropTypes.node,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  variant: PropTypes.string,
  onClick: PropTypes.func,
  collapsible: PropTypes.bool,
  isOpen: PropTypes.bool,
}

export default SectionCard

