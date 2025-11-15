import petHaulApi from './axiosApi'

// .env에 등록된 백엔드 주소 사용 (빌드 타임 또는 런타임)
// 런타임에 평가되도록 함수로 유지 (모듈 로드 시점이 아닌 호출 시점에 평가)
const getBaseApiUrl = () => {
   // 런타임 환경 변수 우선 확인 (server.js에서 주입)
   if (typeof window !== 'undefined' && window.__ENV__?.VITE_APP_API_URL) {
      const runtimeUrl = window.__ENV__.VITE_APP_API_URL
      if (runtimeUrl && 
          runtimeUrl !== 'undefined' && 
          typeof runtimeUrl === 'string' &&
          runtimeUrl.trim() !== '' &&
          runtimeUrl.startsWith('http')) {
         return runtimeUrl
      }
   }
   
   // 빌드 타임 환경 변수
   const buildTimeUrl = import.meta.env.VITE_APP_API_URL
   
   // undefined 문자열 체크 (빌드 타임에 undefined가 문자열로 주입되는 경우)
   if (buildTimeUrl && 
       buildTimeUrl !== 'undefined' && 
       buildTimeUrl !== undefined &&
       typeof buildTimeUrl === 'string' &&
       buildTimeUrl.trim() !== '' &&
       buildTimeUrl.startsWith('http')) {
      return buildTimeUrl
   }
   
   // 기본값
   return 'https://pethaul-api.onrender.com'
}

// 함수로 유지하여 런타임에 평가되도록 함
const getBASE_API_URL = () => getBaseApiUrl()

// 회원가입
export const registerUser = async (userData) => {
      const response = await petHaulApi.post('/auth/join', userData)
      return response
}

// 로그인
export const loginUser = async (credentials) => {
      const response = await petHaulApi.post('/auth/login', credentials)
      return response
}

// 로그아웃
export const logoutUser = async () => {
      const response = await petHaulApi.post('/auth/logout', {}, { withCredentials: true })
      return response
}

// 로그인 상태 확인
export const checkAuthStatus = async () => {
      const response = await petHaulApi.get('/auth/check', {
         timeout: 5000, // 5초 타임아웃
      })
      return response
}

// 아이디 중복 확인
export const checkUsername = async (userId) => {
      const response = await petHaulApi.post('/auth/check-username', { userId })
      return response
}

// 이메일 중복 확인
export const checkEmail = async (email) => {
      const response = await petHaulApi.post('/auth/check-email', { email })
      return response
}

// 구글 로그인 리다이렉트
export const redirectToGoogleLogin = () => {
   // 고정 URL 사용 (환경 변수 문제 방지)
   window.location.href = 'https://pethaul-api.onrender.com/auth/google'
}

// 구글 로그인(DB 저장용 요청 함수)
export const googleLoginUser = async (googleData) => {
      const response = await petHaulApi.post('/auth/google/callback', googleData)
      return response
}

// 구글 로그인 상태 확인
export const googleCheckStatus = async () => {
      const response = await petHaulApi.get('/auth/googlecheck', {
         timeout: 5000, // 5초 타임아웃
      })
      return response.data
}

// 핸드폰 번호로 id 찾기 (로컬 회원)
export const findId = async (phoneNumber) => {
      const response = await petHaulApi.post('/auth/findid', { phoneNumber })
      return response
}

// 임시 비밀번호 발급 (로컬 회원)
export const updatePassword = async ({ userId, phoneNumber }) => {
      const response = await petHaulApi.post('/auth/updatepw', { userId, phoneNumber })
      return response
}

// 회원 정보 수정
export const updateMyInfo = async (data) => {
      const response = await petHaulApi.put('/auth', data)
      return response
}

// 비밀번호 확인
export const verifyPassword = async (password) => {
      const response = await petHaulApi.post('/auth/verify', { password })
      return response
}

// 프로필 이미지 업로드
export const uploadAvatar = async (file) => {
   const formData = new FormData()
   formData.append('avatar', file)
   const response = await petHaulApi.post('/auth/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
   })
   return response
}

// 전체 사용자 목록 조회 (관리자 전용)
export const getAllUsers = async ({ page = 1, limit = 20, searchTerm = '' } = {}) => {
   const response = await petHaulApi.get('/auth/all', {
      params: { page, limit, searchTerm },
   })
   return response
}
