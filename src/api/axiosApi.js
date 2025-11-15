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
      // 세션 기반 인증이 필요한 경우에만 재발급 시도
      if (
         (error.response?.status === 403 || error.response?.status === 401) &&
         !originalRequest._retry &&
         requestUrl !== '/token/get' &&
         requestUrl !== '/auth/check' &&
         requestUrl !== '/auth/googlecheck'
      ) {
         originalRequest._retry = true

         try {
            // 먼저 세션 상태 확인 (세션이 있어야 토큰 발급 가능)
            const authCheckResponse = await axios.get(`${BASE_URL}/auth/check`, {
               withCredentials: true,
               headers: {
                  'Content-Type': 'application/json',
                  Authorization: AUTH_KEY,
               },
            })

            // 세션이 있고 인증된 상태인 경우에만 토큰 발급 시도
            if (authCheckResponse.data?.isAuthenticated) {
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
            } else {
               // 세션이 없으면 재발급 불가능 (조용히 처리)
               // console.debug로 변경하여 불필요한 경고 제거
            }
         } catch (tokenError) {
            // 토큰 발급 실패 시 원래 에러 반환 (조용히 처리)
            // 500 오류는 백엔드 문제이므로 사용자에게 노출하지 않음
            return Promise.reject(error)
         }
      }

      return Promise.reject(error)
   }
)

export default petHaulApi
