import petHaulApi from './axiosApi'

// 토큰 발급
export const getToken = async () => {
   try {
      const response = await petHaulApi.get('/token/get')

      return response
   } catch (error) {
      throw error
   }
}

// 토큰 조회
export const readToken = async () => {
   try {
      const response = await petHaulApi.get('/token/read')
      return response
   } catch (error) {
      throw error
   }
}

// 토큰 재발급
export const refreshToken = async () => {
   try {
      const response = await petHaulApi.get('/token/refresh')
      return response
   } catch (error) {
      throw error
   }
}

// 토큰 상태 확인
export const checkTokenStatus = async () => {
   try {
      const response = await petHaulApi.get('/token/checkTokenStatus')
      return response
   } catch (error) {
      throw error
   }
}
