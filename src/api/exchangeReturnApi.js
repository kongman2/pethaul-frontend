import petHaulApi from './axiosApi'

// 교환/반품 신청
export const createExchangeReturn = async (data) => {
   const response = await petHaulApi.post('/exchange-return', data)
   return response
}

// 내 교환/반품 신청 목록 조회
export const getMyExchangeReturns = async () => {
   const response = await petHaulApi.get('/exchange-return/my')
   return response
}

// 전체 교환/반품 신청 목록 조회 (관리자)
export const getAllExchangeReturns = async () => {
   const response = await petHaulApi.get('/exchange-return/all')
   return response
}

// 교환/반품 상태 변경 (관리자)
export const updateExchangeReturnStatus = async (id, data) => {
   const response = await petHaulApi.patch(`/exchange-return/${id}/status`, data)
   return response
}

