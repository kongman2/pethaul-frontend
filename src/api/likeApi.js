import petHaulApi from './axiosApi'

/**
 * 내가 좋아요한 상품의 'id' 목록
 */
export const getMyLikeIds = async () => {
      const response = await petHaulApi.get('/like/ids')
      return response // 사용처에서 response.data.itemIds
}

/**
 * 내가 좋아요한 '상품 상세' 목록 (카드 렌더용)
 */
export const getMyLikedItems = async () => {
      const response = await petHaulApi.get('/like/me')
      return response // 사용처에서 response.data.items
}

/**
 * 좋아요 토글 (있으면 삭제, 없으면 추가)
 */
export const toggleLike = async (itemId) => {
      const response = await petHaulApi.post(`/like/${itemId}`)
      return response // 사용처에서 response.data.liked
}
