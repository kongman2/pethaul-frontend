import petHaulApi from './axiosApi'

// 리뷰 등록
export const createReview = async (formData) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      const response = await petHaulApi.post('/review', formData, config)
      return response
}

// 리뷰 수정
export const updateReview = async (formData, id) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } }
      const response = await petHaulApi.put(`/review/edit/${id}`, formData, config)
      return response
}

// 리뷰 삭제
export const deleteReview = async (id) => {
      const response = await petHaulApi.delete(`review/${id}`)
      return response
}

// 회원이 작성한 리뷰 목록 조회
export const getUserReview = async (opts = {}) => {
      const { page, limit } = opts
      const params = {}
      if (page != null) params.page = page
      if (limit != null) params.limit = limit
      const response = await petHaulApi.get(`/review`, {
         params,
      })
      return response
}

// 최신 리뷰 목록 — /review/latest 만 사용
export const getLatestReviews = async (params = {}) => {
   try {
      const res = await petHaulApi.get('/review/latest', { params })
      const raw = res?.data

      // 응답 정규화
      let normalized = {
         list: [],
         page: params.page ?? 1,
         size: params.size ?? 0,
         total: 0,
         hasMore: false,
      }

      if (Array.isArray(raw)) {
         normalized.list = raw
         normalized.size = params.size ?? raw.length
         normalized.total = raw.length
      } else if (raw && typeof raw === 'object') {
         const list = raw.list ?? raw.reviews ?? raw.review ?? raw.data ?? raw.rows ?? []
         const page = raw.page ?? params.page ?? 1
         const size = raw.size ?? params.size ?? (Array.isArray(list) ? list.length : 0)
         const total = raw.total ?? raw.count ?? (Array.isArray(list) ? list.length : 0)
         const hasMore = typeof raw.hasMore === 'boolean' ? raw.hasMore : page * size < total
         normalized = { list, page, size, total, hasMore }
      }

      return { data: normalized }
   } catch (error) {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
         return {
            data: {
               list: [],
               page: params.page ?? 1,
               size: params.size ?? 0,
               total: 0,
               hasMore: false,
            },
         }
      }
      throw error
   }
}
