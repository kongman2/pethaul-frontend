import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'

import { verifyPasswordThunk } from '../../../features/authSlice'
import { useAlertModal } from '../../../hooks/useAlertModal'

import { Modal, Button, Input, AlertModal } from '../../common'

import './VerifyModal.scss'

const isNonLocalProvider = (provider) => {
  if (!provider) return false
  const lowered = String(provider).toLowerCase()
  return lowered && lowered !== 'local'
}

export default function VerifyModal() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, googleAuthenticated } = useSelector((state) => state.auth)
  const alertModal = useAlertModal()

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: null, text: '' })
  const inputRef = useRef(null)
  const bg = location.state?.backgroundLocation || { pathname: '/mypage/edit' }

  const provider = user?.provider
  const hasSocialMarkers = Boolean(user?.snsId || user?.socialId || user?.loginType)
  const isSocialUser = googleAuthenticated || isNonLocalProvider(provider) || hasSocialMarkers

  // 입력만 초기화하고 메시지는 유지
  const clearInputKeepMsg = () => {
    setPassword('')
    setSubmitting(false)
    if (!isSocialUser) {
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }
  // 전체 리셋이 필요할 때 사용
  const resetAll = () => {
    setMsg({ type: null, text: '' })
    clearInputKeepMsg()
  }

  // ESC → 입력만 초기화 (소셜 사용자는 무시)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!isSocialUser) {
          clearInputKeepMsg()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isSocialUser])

  const onCloseIcon = (e) => {
    e.preventDefault()
    // X 버튼 클릭 시 바로 마이페이지로 이동
    navigate('/mypage', { replace: true })
  }

  // Backdrop 클릭 시 입력만 초기화 (모달은 닫지 않음)
  const handleBackdropClick = (e) => {
    e.stopPropagation()
    if (!isSocialUser) {
      clearInputKeepMsg()
    }
  }

  const onCancel = (e) => {
    e.preventDefault()
    if (isSocialUser) {
      navigate('/mypage', { replace: true })
    } else {
      clearInputKeepMsg()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (submitting || isSocialUser) return
    setSubmitting(true)
    setMsg({ type: null, text: '' })

    dispatch(verifyPasswordThunk(password))
      .unwrap()
      .then(() => {
        setMsg({ type: 'success', text: '비밀번호가 확인되었습니다.' })
        setTimeout(() => {
          navigate(bg, { replace: true, state: { verified: true } })
        }, 600) // 성공 문구 잠깐 보여주고 이동
      })
      .catch((err) => {
        const text = typeof err === 'string'
          ? err
          : (err?.code === 'INVALID_PASSWORD'
              ? '비밀번호가 올바르지 않습니다.'
              : '비밀번호 확인 중 오류가 발생했습니다. 다시 시도해 주세요.')
        setMsg({ type: 'error', text })
        clearInputKeepMsg() // 메시지는 유지, 입력만 초기화
      })
      .finally(() => setSubmitting(false))
  }

  const handleSocialContinue = () => {
    navigate(bg, { replace: true, state: { verified: true } })
  }

  return (
    <Modal
      open={true}
      onClose={onCloseIcon}
      title="본인 확인"
      size="md"
      closeOnBackdrop={false}
      onBackdropClick={handleBackdropClick}
      bodyClassName="verify-modal__body"
    >
      <form onSubmit={handleSubmit} autoComplete="off" className="verify-modal__form">
          {msg.text && (
          <p className={`verify-modal__msg verify-modal__msg--${msg.type}`}>
              {msg.text}
            </p>
          )}

          {isSocialUser ? (
          <div className="verify-modal__social">
              <p>소셜 로그인 사용자입니다.<br />비밀번호 입력없이 계속 진행할 수 있어요.</p>
            <div className="verify-modal__actions">
              <Button variant="ghost" size="sm" onClick={onCancel}>취소</Button>
              <Button variant="primary" size="sm" onClick={handleSocialContinue}>계속하기</Button>
              </div>
            </div>
          ) : (
            <>
              <Input
                ref={inputRef}
                id="password"
                type="password"
                label="비밀번호"
                placeholder="비밀번호를 입력하세요."
                value={password}
                onChange={setPassword}
                required
                autoFocus
                error={msg.type === 'error' ? msg.text : undefined}
                state={msg.type === 'error' ? 'error' : msg.type === 'success' ? 'success' : undefined}
              />

            <div className="verify-modal__actions">
              <Button variant="ghost" size="sm" onClick={onCancel}>다시 입력</Button>
              <Button variant="primary" size="sm" type="submit" disabled={submitting}>
                  {submitting ? '확인 중...' : '확인'}
              </Button>
              </div>
            </>
          )}
        </form>
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </Modal>
  )
}
