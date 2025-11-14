import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getQna, createQna, getQnaDetail, editQna, enterComment, deleteQna } from '../api/qnaApi'

// 문의 조회
export const getQnaThunk = createAsyncThunk('qna/getQna', async (data, { rejectWithValue }) => {
   try {
      const response = await getQna(data)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '문의 조회 실패')
   }
})

// 문의 상세조회
export const getQnaDetailThunk = createAsyncThunk('qna/getQnaDetail', async (id, { rejectWithValue }) => {
   try {
      const response = await getQnaDetail(id)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '문의 조회 실패')
   }
})

// 문의 작성
export const createQnaThunk = createAsyncThunk('qna/createQna', async (data, { rejectWithValue }) => {
   try {
      const response = await createQna(data)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '문의 등록 실패')
   }
})

// 문의 수정
export const editQnaThunk = createAsyncThunk('qna/editQna', async ({ id, data }, { rejectWithValue }) => {
   try {
      const response = await editQna({ id, data })
      return response.data.message
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '문의 수정 실패')
   }
})

// 문의 삭제
export const deleteQnaThunk = createAsyncThunk('qna/deleteQna', async (id, { rejectWithValue }) => {
   try {
      const response = await deleteQna(id)
      return response.data.message
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '문의 삭제 실패')
   }
})

// 문의에 답글 달기 (관리자)
export const enterCommentThunk = createAsyncThunk('qna/enterComment', async ({ id, comment }, { rejectWithValue }) => {
   try {
      const response = await enterComment({ id, comment })
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '답글 작성 실패')
   }
})

export const qnaSlice = createSlice({
   name: 'qna',
   initialState: {
      qna: null,
      qnaList: [],
      pagination: null,
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // 문의 조회
         .addCase(getQnaThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getQnaThunk.fulfilled, (state, action) => {
            state.loading = false
            state.qnaList = action.payload.data
            state.pagination = action.payload.pagination
         })
         .addCase(getQnaThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 문의 상세 조회
         .addCase(getQnaDetailThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getQnaDetailThunk.fulfilled, (state, action) => {
            state.loading = false
            state.qna = action.payload.qna
         })
         .addCase(getQnaDetailThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 문의 등록
         .addCase(createQnaThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createQnaThunk.fulfilled, (state, action) => {
            state.loading = false
            state.qna = action.payload.qna
         })
         .addCase(createQnaThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 문의 수정
         .addCase(editQnaThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(editQnaThunk.fulfilled, (state, action) => {
            state.loading = false
            state.qna = action.payload
         })
         .addCase(editQnaThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 문의 삭제
         .addCase(deleteQnaThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(deleteQnaThunk.fulfilled, (state) => {
            state.loading = false
         })
         .addCase(deleteQnaThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 답글 작성 (관리자)
         .addCase(enterCommentThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(enterCommentThunk.fulfilled, (state, action) => {
            state.loading = false
            state.qna = action.payload
         })
         .addCase(enterCommentThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default qnaSlice.reducer
