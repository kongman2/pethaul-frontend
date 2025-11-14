import './AuthFormLayout.scss'
import 발바닥Img from '../../../assets/발바닥.png'

function AuthFormLayout({
  title,
  iconSrc = 발바닥Img,
  iconAlt = '발바닥 아이콘',
  subtitle,
  formClassName = '',
  bodyClassName = '',
  children,
}) {
  const formClasses = [
    'auth-form w-100 shadow-sm rounded-4 bg-white px-3 px-sm-4 px-md-5 py-4 py-md-5 text-center mx-auto',
    formClassName,
  ]
    .filter(Boolean)
    .join(' ')

  const bodyClasses = [bodyClassName].filter(Boolean).join(' ')

  return (
    <section className="container py-4 py-md-5 d-flex flex-column align-items-center justify-content-center">
      <div className={formClasses}>
        <header className="auth-form__header mb-4">
          <h1 className="auth-form__title d-flex align-items-center justify-content-center gap-2 mb-0">
            {title}
            {iconSrc && <img src={iconSrc} alt={iconAlt} />}
          </h1>
          {subtitle && <p className="auth-form__subtitle text-muted mt-2 mb-0">{subtitle}</p>}
        </header>
        <div className={bodyClasses}>{children}</div>
      </div>
    </section>
  )
}

export default AuthFormLayout
