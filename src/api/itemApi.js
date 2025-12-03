import petHaulApi from './axiosApi'
import qs from 'qs'
import { normalizeCategoryName } from '../utils/itemFilters'

// 상품 등록 (FormData 사용)
export const createItem = async (formData) => {
      // FormData를 사용할 때는 Content-Type을 명시하지 않음
      // axios가 자동으로 multipart/form-data와 boundary를 설정하고,
      // 요청 인터셉터에서 설정한 Authorization 헤더가 유지됨
      const response = await petHaulApi.post('/item', formData)
      return response
}

// 상품 수정 (FormData 사용)
export const updateItem = async (id, formData) => {
      // FormData를 사용할 때는 Content-Type을 명시하지 않음
      // axios가 자동으로 multipart/form-data와 boundary를 설정하고,
      // 요청 인터셉터에서 설정한 Authorization 헤더가 유지됨
      const response = await petHaulApi.put(`/item/${id}`, formData)
      return response
}

// 상품 삭제
export const deleteItem = async (id) => {
      const response = await petHaulApi.delete(`/item/${id}`)
      return response
}

// 전체 상품 리스트 가져오기
export const getItems = async (data) => {
      const { page, limit, searchTerm = '', sellCategory = [] } = data
      const activeCategories = Array.isArray(sellCategory)
         ? sellCategory.filter(Boolean) // ["강아지", "고양이"]
         : sellCategory
         ? [sellCategory] // ["강아지"]
         : []

      // 카테고리 정규화 
      const normalizedCategories = activeCategories.map(cat => normalizeCategoryName(cat))

      const response = await petHaulApi.get('item', {
         params: {
            page,
            limit,
            searchTerm,
            sellCategory: normalizedCategories,
         },
         paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
      })

      return response
}

// 특정 상품 가져오기
export const getItemById = async (id) => {
      const response = await petHaulApi.get(`/item/${id}`)
      return response
}

// // 조건별 데이터 조회 (회원용)
// export const fetchSortData = async (limit) => {
//    try {
//       const response = await shopmaxApi.get(`/item/all/main?limit=${limit}`)
//       return response
//    } catch (error) {
//       throw error
//    }
// }

// 조건별 데이터 조회 (회원용)
export const fetchSortData = async (limit) => {
   try {
      const response = await petHaulApi.get('/item/all/main', {
         params: { limit },
      })
      return response
   } catch (error) {
      if (error.response?.status === 500) {
      }
      throw error
   }
}

// 인기 검색어 가져오기
export const getPopularKeywords = async (limit = 4) => {
   try {
      const response = await petHaulApi.get('/item/popular-keywords', {
         params: { limit },
      })
      return response.data?.keywords || []
   } catch (error) {
      return []
   }
}
