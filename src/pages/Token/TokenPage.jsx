import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import {
  checkTokenStatusThunk,
  getTokenThunk,
  readTokenThunk,
  refreshTokenThunk,
} from '../../features/tokenSlice'
import { Button, Input, SectionCard, Spinner, AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import useAppBackground from '../../hooks/useAppBackground'

function TokenPage() {
  useAppBackground('app-bg--dots')
  const dispatch = useDispatch()
  const { token, tokenStatus, loading, error } = useSelector((state) => state.token)
  const { alert, alertModal } = useModalHelpers()

  // 보유한 토큰 조회
  useEffect(() => {
    dispatch(readTokenThunk())
  }, [dispatch])

  // 토큰 유효성 검증
  useEffect(() => {
    if (token) dispatch(checkTokenStatusThunk())
  }, [dispatch, token])

  // 토큰 발급 onClick
  const handleGetToken = () => {
    dispatch(getTokenThunk())
  }

  // 토큰 유효성 검증 실패시 재발급 onClick
  const handleRefreshToken = () => {
    dispatch(refreshTokenThunk())
  }

  // 토큰 복사
  const handleCopyToken = async () => {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token)
      alert('토큰이 클립보드에 복사되었습니다.', '완료', 'success')
    } catch (err) {
      alert('토큰 복사에 실패했습니다.', '오류', 'danger')
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8 col-xl-6">
            <Spinner text="토큰 정보를 불러오는 중..." />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8 col-xl-6">
          {/* 페이지 헤더 */}
          <div className="mb-4 text-center">
            <h1 className="display-5 fw-bold mb-2">API Key 관리</h1>
            <p className="text-muted">API를 사용하기 위한 인증 키를 발급받으세요</p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-exclamation-triangle-fill me-2" viewBox="0 0 16 16">
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
              </svg>
              <div>
                <strong>에러 발생:</strong> {error}
              </div>
            </div>
          )}

          {/* 토큰 카드 */}
          <SectionCard 
            title="API Key"
            headerActions={
              token && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={handleCopyToken}
                  title="토큰 복사"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard" viewBox="0 0 16 16">
                    <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                    <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                  </svg>
                </button>
              )
            }
          >
            <div className="mb-4">
              <label className="form-label fw-semibold">
                발급된 토큰
              </label>
              <Input
                type="text"
                value={token || ''}
                placeholder="토큰이 발급되면 여기에 표시됩니다"
                disabled
              />
              <small className="text-muted">
                이 토큰은 안전하게 보관하시고 타인에게 공유하지 마세요.
              </small>
            </div>

            {/* 토큰 상태별 UI */}
            {token ? (
              <>
                {/* 정상 상태 */}
                {tokenStatus === 'valid' && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    <div>토큰이 정상적으로 발급되었습니다.</div>
                  </div>
                )}

                {/* 만료 상태 */}
                {tokenStatus === 'expired' && (
                  <div className="alert alert-warning" role="alert">
                    <div className="d-flex align-items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-exclamation-circle-fill me-2" viewBox="0 0 16 16">
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
                      </svg>
                      <div>토큰이 만료되었습니다.</div>
                    </div>
                    <Button
                      variant="warning"
                      onClick={handleRefreshToken}
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                          <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                        </svg>
                      }
                    >
                      재발급받기
                    </Button>
                  </div>
                )}

                {/* 유효하지 않음 */}
                {tokenStatus === 'invalid' && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-x-circle-fill me-2" viewBox="0 0 16 16">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                    </svg>
                    <div>
                      토큰이 유효하지 않습니다. 관리자에게 문의하세요.
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* 토큰 없음 - 발급 안내 */
              <div className="text-center py-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-key text-muted mb-3" viewBox="0 0 16 16">
                  <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8zm4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5z"/>
                  <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                <h5 className="mb-3">API Key가 발급되지 않았습니다</h5>
                <p className="text-muted mb-4">
                  아래 버튼을 클릭하여 API Key를 발급받으세요.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGetToken}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                  }
                >
                  토큰 발급받기
                </Button>
              </div>
            )}
          </SectionCard>

          {/* 안내 사항 */}
          <div className="card mt-4">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-info-circle me-2" viewBox="0 0 16 16">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                </svg>
                주의사항
              </h6>
              <ul className="list-unstyled mb-0 small text-muted">
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  토큰은 API 요청 시 인증에 사용됩니다.
                </li>
                <li className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  토큰을 타인과 공유하지 마세요.
                </li>
                <li className="mb-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check2 me-2" viewBox="0 0 16 16">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                  </svg>
                  토큰이 유출된 경우 즉시 재발급하세요.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </section>
  )
}

export default TokenPage
