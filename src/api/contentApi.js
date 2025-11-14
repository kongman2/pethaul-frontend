import petHaulApi from './axiosApi'

// 목록 조회 (페이지네이션)
export const fetchContentsApi = async ({ page = 1, size = 10, tag, q, status } = {}) => {
   const params = { page, size }
   if (tag) params.tag = tag
   if (q) params.q = q
   if (status) params.status = status
   const { data } = await petHaulApi.get('/contents', { params })
   return data // { list, page, size, total, hasMore }
}

// 단건 조회
export const fetchContentByIdApi = async (id) => {
   const { data } = await petHaulApi.get(`/contents/${id}`)
   return data
}

// 생성 (관리자 전용)
export const createContentApi = async (payload) => {
   const { data } = await petHaulApi.post('/contents', payload)
   return data
}

// 수정 (관리자 전용)
export const updateContentApi = async (id, payload) => {
   const { data } = await petHaulApi.put(`/contents/${id}`, payload)
   return data
}

// 삭제 (관리자 전용)
export const deleteContentApi = async (id) => {
   const { data } = await petHaulApi.delete(`/contents/${id}`)
   return data
}

// 이미지 업로드 (단독 URL 발급)
// - 백엔드가 파일을 저장하고 공용 URL을 반환합니다: { url }
// - 반환된 url을 coverUrl 혹은 thumbUrl로 create/update에 포함시키세요.
export const uploadContentImageApi = async (file) => {
   const form = new FormData()
   form.append('image', file)
   const { data } = await petHaulApi.post('/contents/images', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
   })
   return data // { url }
}
