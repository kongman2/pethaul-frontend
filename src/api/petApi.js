import petHaulApi from './axiosApi'

//유저  펫 조회
export const getUserPets = async () => {
      const response = await petHaulApi.get(`/pets`)
      return response
}

// 펫 등록 (이미지 포함)
export const createPet = async (formData) => {
      const config = {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      }
      const response = await petHaulApi.post('/pets', formData, config)
      return response
}

// 펫 수정
export const updatePet = async (id, formData) => {
      const config = {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      }
      const response = await petHaulApi.put(`/pets/edit/${id}`, formData, config)
      return response
}

// 펫 삭제
export const deletePet = async (id) => {
      const response = await petHaulApi.delete(`/pets/${id}`)
      return response
}
