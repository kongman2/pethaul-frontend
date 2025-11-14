import petHaulApi from './axiosApi'

// 주문 생성
export const createOrder = async (orderData) => {
      const response = await petHaulApi.post('/order', orderData)
      return response
}

// 주문 목록 조회
export const getOrders = async (opts = {}) => {
      const { page, limit } = opts
      const params = {}
      if (page != null) params.page = page
      if (limit != null) params.limit = limit

      const response = await petHaulApi.get('/order', { params })
      return response
}

// 주문 상세 조회
export const getOrderById = async (orderId) => {
      const response = await petHaulApi.get(`/order/${orderId}`)
      return response
}

// 주문 취소
export const cancelOrder = async (orderId) => {
      const response = await petHaulApi.patch(`/order/${orderId}/cancel`)
      return response
}

//주문 상태 변경
export const updateOrderStatus = async (orderId, status) => {
      const response = await petHaulApi.patch(`/order/${orderId}?status=${status}`)
      return response
}

// 구매 확정
export const confirmPurchase = async (orderId) => {
      const response = await petHaulApi.patch(`/order/${orderId}/confirm`)
      return response
}

//전체 주문 조회(관리자용)
export const fetchAllOrders = async (sort) => {
      const params = {}
      if (sort) params.sort = sort
      const response = await petHaulApi.get('/order/all/admin', { params })
      return response
}
