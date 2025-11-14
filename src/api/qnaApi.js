import petHaulApi from './axiosApi'

// 문의 조회
export const getQna = async (data) => {
   const { id, role, page, limit } = data
   const response = await petHaulApi.get('/qna', {
      params: { id, role, page, limit },
   })
   return response
}

// 문의 작성
export const createQna = async (data) => {
   const response = await petHaulApi.post('/qna', data)
   return response
}

// 문의 상세 조회
export const getQnaDetail = async (id) => {
   const response = await petHaulApi.get(`/qna/${id}`)
   return response
}

// 문의 수정
export const editQna = async ({ id, data }) => {
   const response = await petHaulApi.put(`/qna/edit/${id}`, data)
   return response
}

// 문의 삭제
export const deleteQna = async (id) => {
   const response = await petHaulApi.delete(`/qna/${id}`)
   return response
}

// 문의에 답글 달기(관리자)
export const enterComment = async ({ id, comment }) => {
   const response = await petHaulApi.patch(`/qna/comment/${id}`, { comment })
   return response
}
