import petHaulApi from './axiosApi'

// .env에 등록된 백엔드 주소 사용
const BASE_API_URL = import.meta.env.VITE_APP_API_URL

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
   window.location.href = `${BASE_API_URL}/auth/google`
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
