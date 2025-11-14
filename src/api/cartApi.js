import petHaulApi from './axiosApi'

// 장바구니 전체 조회
export const getCartItems = async (id) => {
      const response = await petHaulApi.get(`/cart/${id}`, {
         withCredentials: true,
      })
      return response.data
}

// 장바구니에 상품 추가
export const addToCart = async ({ itemId, count }) => {
      const response = await petHaulApi.post('/cart/add', { itemId, count }, { withCredentials: true })
      return response.data
}

// 장바구니 수량 수정
export const updateCartItem = async ({ itemId, count }) => {
      const response = await petHaulApi.put(`/cart/update/${itemId}`, { count }, { withCredentials: true })
      return response.data
}

// 장바구니 상품 삭제
export const deleteCartItem = async (itemId) => {
      const response = await petHaulApi.delete(`/cart/delete/${itemId}`, {
         withCredentials: true,
      })
      return response.data
}
