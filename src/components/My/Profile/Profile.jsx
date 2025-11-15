import { Link, useNavigate } from 'react-router-dom'
import { useRef } from 'react'
import { getProfileImage } from '../../../utils/imageUtils'
import './Profile.scss'

function Profile({ user, loading = false }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const handleAvatarClick = () => {
    if (!loading && user) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // 회원정보 수정 페이지로 이동하면서 파일 정보 전달
      navigate('/mypage/edit', { state: { uploadAvatar: true, avatarFile: file } })
    }
    e.target.value = ''
  }

  if (loading || !user) {
    return (
      <div className="profile-card profile-card--loading">
        <div className="profile-card__visual skeleton" aria-hidden />
        <div className="profile-card__info">
          <p className="skeleton">이름: 로딩중...</p>
          <p className="skeleton">이메일: 로딩중...</p>
          <p className="skeleton">전화번호: 로딩중...</p>
          <p className="skeleton">권한: 로딩중...</p>
        </div>
      </div>
    )
  }

  const displayName = user.name || '이름 미등록'
  const displayEmail = user.email || '이메일 미등록'
  const displayPhone =
    user.phoneNumber ?? user.phone ?? (user.provider === 'google' ? '구글 계정 연동 (전화번호 미등록)' : '미등록')
  const avatar = user.avatar || user.picture || getProfileImage()

  return (
    <div className="profile-card d-flex flex-column flex-sm-row flex-lg-column align-items-center justify-content-center gap-3">
      <div className="profile-card__visual flex-grow-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="d-none"
        />
        <img
          src={avatar}
          alt={`${displayName}의 프로필 사진`}
          onError={(e) => {
            e.currentTarget.src = getProfileImage()
          }}
          className="profile-card__avatar"
          onClick={handleAvatarClick}
          style={{ cursor: 'pointer' }}
          title="클릭하여 프로필 사진 변경"
        />
      </div>

      <div className="profile-card__info d-flex flex-column justify-content-center gap-3 flex-grow-1">
        <p className="mb-0">
          <span className="profile-card__label">닉네임</span>
          {displayName}
        </p>
        <p className="mb-0">
          <span className="profile-card__label">이메일</span>
          {displayEmail}
        </p>
        <p className="mb-0">
          <span className="profile-card__label">전화번호</span>
          {displayPhone}
        </p>

        <div className="d-flex justify-content-center justify-content-sm-start justify-content-lg-center mt-2">
          <Link to="/mypage/edit" className="profile-card__edit-link">
            회원정보수정
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Profile
