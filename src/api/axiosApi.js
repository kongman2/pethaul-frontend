import axios from 'axios'

const BASE_URL = import.meta.env.VITE_APP_API_URL
const AUTH_KEY = import.meta.env.VITE_APP_AUTH_KEY

//axios 인스턴스 생성
const petHaulApi = axios.create({
   baseURL: BASE_URL,
   headers: {
      'Content-Type': 'application/json',
      Authorization: AUTH_KEY,
   },
   withCredentials: true,
   timeout: 10000, // 10초 타임아웃
})

// 요청 인터셉터
petHaulApi.interceptors.request.use(
   (config) => {
      const token = localStorage.getItem('token')
      if (token) {
         config.headers.Authorization = token
      }
      
      // /qna 요청은 플래그 추가 (응답 인터셉터에서 건너뛰기 위해)
      if (config.url === '/qna') {
         config.skipResponseInterceptor = true
         return config
      }
      
      return config
   },
   (error) => Promise.reject(error)
)

// 응답 인터셉터
petHaulApi.interceptors.response.use(
   (response) => {
      // /qna 엔드포인트는 인터셉터 건너뛰기 (무한 루프 방지)
      if (response.config?.skipResponseInterceptor) {
         return response
      }
      return response
   },
   (error) => {
      const requestUrl = error.config?.url

      // /qna 엔드포인트 에러는 로그 없이 반환
      if (error.config?.skipResponseInterceptor) {
         return Promise.reject(error)
      }

      // 관리자 주문 조회 404는 빈 데이터 상태이므로 에러 로그를 생략
      if (error.response?.status === 404 && requestUrl === '/order/all/admin') {
         return Promise.reject(error)
      }

      return Promise.reject(error)
   }
)

export default petHaulApi
