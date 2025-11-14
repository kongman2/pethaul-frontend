import './Spinner.scss'

/**
 * Spinner Props:
 * - size?: 'sm' | 'md' | 'lg' (스피너 크기)
 * - fullPage?: boolean (전체 페이지 중앙)
 * - text?: string (로딩 텍스트)
 * - className?: string (추가 CSS 클래스)
 */
export const Spinner = ({
  size = 'md',
  fullPage = false,
  text = '로딩 중...',
  className = '',
}) => {
  const spinnerClasses = [
    'pethaul-spinner',
    `pethaul-spinner--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const containerClasses = [
    'pethaul-spinner-container',
    fullPage && 'pethaul-spinner-container--fullpage',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
        <div className="spinner-dot"></div>
      </div>
      {text && <p className="pethaul-spinner-text">{text}</p>}
    </div>
  )
}

export default Spinner

