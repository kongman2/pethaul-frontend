import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
   createExchangeReturn,
   getMyExchangeReturns,
   getAllExchangeReturns,
   updateExchangeReturnStatus,
} from '../api/exchangeReturnApi'

// 교환/반품 신청
export const createExchangeReturnThunk = createAsyncThunk(
   'exchangeReturn/create',
   async (data, { rejectWithValue }) => {
      try {
         const response = await createExchangeReturn(data)
         return response.data
      } catch (error) {
         return rejectWithValue(error.response?.data?.message || '교환/반품 신청 실패')
      }
   }
)

// 내 교환/반품 신청 목록 조회
export const getMyExchangeReturnsThunk = createAsyncThunk(
   'exchangeReturn/getMy',
   async (_, { rejectWithValue }) => {
      try {
         const response = await getMyExchangeReturns()
         return response.data
      } catch (error) {
         return rejectWithValue(error.response?.data?.message || '교환/반품 목록 조회 실패')
      }
   }
)

// 전체 교환/반품 신청 목록 조회 (관리자)
export const getAllExchangeReturnsThunk = createAsyncThunk(
   'exchangeReturn/getAll',
   async (_, { rejectWithValue }) => {
      try {
         const response = await getAllExchangeReturns()
         return response.data
      } catch (error) {
         return rejectWithValue(error.response?.data?.message || '교환/반품 목록 조회 실패')
      }
   }
)

// 교환/반품 상태 변경 (관리자)
export const updateExchangeReturnStatusThunk = createAsyncThunk(
   'exchangeReturn/updateStatus',
   async ({ id, ...data }, { rejectWithValue }) => {
      try {
         const response = await updateExchangeReturnStatus(id, data)
         return response.data
      } catch (error) {
         return rejectWithValue(error.response?.data?.message || '상태 변경 실패')
      }
   }
)

const exchangeReturnSlice = createSlice({
   name: 'exchangeReturn',
   initialState: {
      myExchangeReturns: [],
      allExchangeReturns: [],
      loading: false,
      error: null,
   },
   reducers: {},
   extraReducers: (builder) => {
      builder
         // 교환/반품 신청
         .addCase(createExchangeReturnThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createExchangeReturnThunk.fulfilled, (state, action) => {
            state.loading = false
            state.myExchangeReturns = [action.payload.exchangeReturn, ...state.myExchangeReturns]
         })
         .addCase(createExchangeReturnThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 내 교환/반품 목록 조회
         .addCase(getMyExchangeReturnsThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getMyExchangeReturnsThunk.fulfilled, (state, action) => {
            state.loading = false
            state.myExchangeReturns = action.payload.exchangeReturns || []
         })
         .addCase(getMyExchangeReturnsThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 전체 교환/반품 목록 조회
         .addCase(getAllExchangeReturnsThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(getAllExchangeReturnsThunk.fulfilled, (state, action) => {
            state.loading = false
            state.allExchangeReturns = action.payload.exchangeReturns || []
         })
         .addCase(getAllExchangeReturnsThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 상태 변경
         .addCase(updateExchangeReturnStatusThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateExchangeReturnStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            const updated = action.payload.exchangeReturn
            state.allExchangeReturns = state.allExchangeReturns.map((er) =>
               er.id === updated.id ? updated : er
            )
            state.myExchangeReturns = state.myExchangeReturns.map((er) =>
               er.id === updated.id ? updated : er
            )
         })
         .addCase(updateExchangeReturnStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export default exchangeReturnSlice.reducer

