import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createItem, updateItem, deleteItem, getItems, getItemById, fetchSortData } from '../api/itemApi'
import { recommendLikes } from '../api/recommend'

// 상품 등록
export const createItemThunk = createAsyncThunk('items/createItem', async (formData, { rejectWithValue }) => {
   try {
      const response = await createItem(formData)
      return {
         item: response.data.item,
         images: response.data.images || [],
         categories: response.data.categories || [],
      }
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '상품 등록 실패')
   }
})

// 상품 수정
export const updateItemThunk = createAsyncThunk('items/updateItem', async ({ id, formData }, { rejectWithValue }) => {
   try {
      await updateItem(id, formData)
      return id
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '상품 수정 실패')
   }
})

// 상품 삭제
export const deleteItemThunk = createAsyncThunk('items/deleteItem', async (id, { rejectWithValue }) => {
   try {
      await deleteItem(id)
      return id
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '상품 삭제 실패')
   }
})

// 전체 상품 리스트 가져오기 (목록/검색 전용)
export const fetchItemsThunk = createAsyncThunk('items/getItems', async (data, { rejectWithValue }) => {
   try {
      const response = await getItems(data)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '전체 상품 리스트 가져오기 실패')
   }
})

// 특정 상품 가져오기 (상세)
export const fetchItemByIdThunk = createAsyncThunk('items/fetchItemById', async (id, { rejectWithValue }) => {
   try {
      const response = await getItemById(id)
      return response.data.item
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '특정 상품 가져오기 실패')
   }
})

// 메인용 정렬 데이터(Top/Today/New)
export const fetchSortDataThunk = createAsyncThunk('order/fetchSortData', async (limit, { rejectWithValue }) => {
   try {
      const response = await fetchSortData(limit)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '데이터 조회 실패')
   }
})

// 추천 상품 조회
export const recommendLikesThunk = createAsyncThunk('recommend/recommendLikes', async (userId, { rejectWithValue }) => {
   try {
      const response = await recommendLikes(userId)

      return response.result
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '좋아요 상품 조회 실패')
   }
})

const initialState = {
   item: null, // 상세
   main: {
      // 메인 전용 데이터
      topSales: [],
      topToday: [],
      newItems: [],
   },
   list: [], // 목록/검색 전용 데이터
   items: [], // :white_check_mark: 기존 코드 호환(= list 미러)
   recommends: [], // 유저 별 추천 상품 데이터
   pagination: null, // 페이징 객체
   loading: false,
   error: null,
}

const itemSlice = createSlice({
   name: 'items',
   initialState,
   reducers: {},
   extraReducers: (builder) => {
      builder
         // 상품 등록
         .addCase(createItemThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createItemThunk.fulfilled, (state, action) => {
            state.loading = false
            state.item = action.payload.item
         })
         .addCase(createItemThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 상품 수정
         .addCase(updateItemThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateItemThunk.fulfilled, (state) => {
            state.loading = false
         })
         .addCase(updateItemThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 상품 삭제
         .addCase(deleteItemThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(deleteItemThunk.fulfilled, (state, action) => {
            state.loading = false
            // 삭제된 아이템을 목록에서 제거
            const deletedId = action.payload
            state.list = state.list.filter((item) => item.id !== deletedId && item.itemId !== deletedId)
            state.items = state.list // 호환성 유지
            // 상세 페이지에서 삭제된 아이템이면 null로 설정
            if (state.item && (state.item.id === deletedId || state.item.itemId === deletedId)) {
               state.item = null
            }
         })
         .addCase(deleteItemThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 전체 상품 리스트 가져오기 (목록/검색)
         .addCase(fetchItemsThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItemsThunk.fulfilled, (state, action) => {
            state.loading = false
            const payload = action.payload
            const list = Array.isArray(payload) ? payload : payload?.items ?? []
            state.list = list
            state.items = list // :white_check_mark: 호환: 기존 컴포넌트가 state.item.items를 읽어도 동작하도록
            state.pagination = action.payload.pagination
         })
         .addCase(fetchItemsThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 특정 상품 가져오기 (상세)
         .addCase(fetchItemByIdThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchItemByIdThunk.fulfilled, (state, action) => {
            state.loading = false
            state.item = action.payload
         })
         .addCase(fetchItemByIdThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 메인 데이터 (Top/Today/New)
         .addCase(fetchSortDataThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchSortDataThunk.fulfilled, (state, action) => {
            state.loading = false
            const payload = action.payload ?? {}
            const data = payload?.data ?? payload?.result ?? payload
            state.main = {
               topSales: Array.isArray(data?.topSales) ? data.topSales : [],
               topToday: Array.isArray(data?.topToday) ? data.topToday : [],
               newItems: Array.isArray(data?.newItems) ? data.newItems : [],
            }
            // :x: 더 이상 state.items를 건드리지 않음 (메인/목록 분리)
         })
         .addCase(fetchSortDataThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 추천상품 조회
         .addCase(recommendLikesThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(recommendLikesThunk.fulfilled, (state, action) => {
            state.loading = false
            state.recommends = action.payload || []
         })
         .addCase(recommendLikesThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})
export const { setFilters } = itemSlice.actions
export default itemSlice.reducer
