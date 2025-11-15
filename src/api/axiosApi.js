import axios from 'axios'

const BASE_URL = (import.meta.env.VITE_APP_API_URL || '').replace(/\/$/, '') // 끝의 슬래시 제거
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
   async (config) => {
      // /token/get 요청은 토큰 없이도 가능 (세션 기반 인증)
      if (config.url === '/token/get') {
         return config
      }

      const token = localStorage.getItem('token')
      
      // JWT 토큰이 있으면 사용
      if (token) {
         config.headers.Authorization = token
      } else {
         // 토큰이 없을 때는 기본 AUTH_KEY 사용 (공개 API용)
         // 인증이 필요한 API는 403 에러가 발생하고, 응답 인터셉터에서 토큰을 재발급받음
         config.headers.Authorization = AUTH_KEY
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
   async (error) => {
      const requestUrl = error.config?.url
      const originalRequest = error.config

      // /qna 엔드포인트 에러는 로그 없이 반환
      if (error.config?.skipResponseInterceptor) {
         return Promise.reject(error)
      }

      // 관리자 주문 조회 404는 빈 데이터 상태이므로 에러 로그를 생략
      if (error.response?.status === 404 && requestUrl === '/order/all/admin') {
         return Promise.reject(error)
      }

      // 403 Forbidden 또는 401 Unauthorized 에러 발생 시 토큰 재발급 시도
      // 단, /token/get 요청 자체가 실패한 경우는 제외 (무한 루프 방지)
      if (
         (error.response?.status === 403 || error.response?.status === 401) &&
         !originalRequest._retry &&
         requestUrl !== '/token/get'
      ) {
         originalRequest._retry = true

         try {
            // 토큰 발급 API 호출 (세션 기반 인증이므로 가능)
            // AUTH_KEY를 사용하여 세션 기반 인증으로 토큰 발급
            const tokenResponse = await axios.get(`${BASE_URL}/token/get`, {
               withCredentials: true,
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: AUTH_KEY,
               },
            })

            if (tokenResponse.data?.token) {
               localStorage.setItem('token', tokenResponse.data.token)
               // 원래 요청의 Authorization 헤더 업데이트
               originalRequest.headers.Authorization = tokenResponse.data.token
               // 원래 요청 재시도
               return petHaulApi(originalRequest)
            }
         } catch (tokenError) {
            // 토큰 발급 실패 시 원래 에러 반환
            console.warn('⚠️ 토큰 자동 재발급 실패:', tokenError)
            return Promise.reject(error)
         }
      }

      return Promise.reject(error)
   }
)

export default petHaulApi
