import noImageImg from '../assets/no-image.png'
import profileImg from '../assets/profile.png'
import petProfileImg from '../assets/petprofile.png'

/**
 * API 이미지 URL을 절대 경로로 변환
 * - 이미 http/https로 시작하면 그대로 반환
 * - 상대 경로인 경우 API_BASE_URL을 붙여서 반환
 * - 레거시 이미지 URL (/filename.jpg)을 /uploads/filename.jpg로 변환
 * 
 * @param {string} url - 이미지 URL (절대 경로 또는 상대 경로)
 * @returns {string} 완전한 이미지 URL
 */
export const buildImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  const API = (`${import.meta.env.VITE_APP_API_URL}` || '').replace(/\/$/, '')
  
  // 레거시 이미지 URL 처리: /filename.jpg -> /uploads/filename.jpg
  // 단, 이미 /uploads/로 시작하거나 /api/, /static/ 등 다른 경로는 그대로 유지
  let cleanUrl = url.startsWith('/') ? url : `/${url}`
  
  // 루트 경로의 이미지 파일인 경우 /uploads/ 추가
  // 예: /KakaoTalk_Photo_2024-12-10-18-32-23.jpeg -> /uploads/KakaoTalk_Photo_2024-12-10-18-32-23.jpeg
  if (cleanUrl.match(/^\/([^\/]+\.(?:png|jpe?g|webp|gif|svg))$/i) && !cleanUrl.startsWith('/uploads/')) {
    cleanUrl = `/uploads${cleanUrl}`
  }
  
  return `${API}${cleanUrl}`
}

/**
 * 이미지 URL이 없을 때 기본 이미지 반환
 * 
 * @param {string} url - 이미지 URL
 * @param {string} defaultImage - 기본 이미지 (import된 이미지 또는 URL 문자열)
 * @returns {string} 이미지 URL 또는 기본 이미지
 */
export const getImageUrl = (url, defaultImage = noImageImg) => {
  if (!url) return defaultImage
  return buildImageUrl(url)
}

/**
 * 상품 이미지가 없을 때 기본 이미지 반환 (no-image.png)
 * ItemCard, ItemCartPage, OrderState, MyOrderList, ItemPanel, itemDetailPage에서 사용
 */
export const getPlaceholderImage = () => noImageImg

/**
 * 사용자 프로필 기본 이미지 반환 (profile.png)
 */
export const getProfileImage = () => profileImg

/**
 * 상품 이미지가 없을 때 기본 이미지 반환 (no-image.png)
 * getPlaceholderImage와 동일하지만 호환성을 위해 유지
 */
export const getNoImage = () => noImageImg

/**
 * 펫 프로필 기본 이미지 반환 (petprofile.png)
 */
export const getPetProfileImage = () => petProfileImg

/**
 * 콘텐츠 이미지 URL 처리 (coverUrl 우선, 없으면 thumbUrl)
 * 
 * @param {string} coverUrl - 커버 이미지 URL
 * @param {string} thumbUrl - 썸네일 이미지 URL
 * @returns {string} 이미지 URL
 */
export const getContentImageUrl = (coverUrl, thumbUrl) => {
  return buildImageUrl(coverUrl || thumbUrl || '')
}

