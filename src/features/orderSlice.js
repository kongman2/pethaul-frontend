import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { createOrder, getOrders, getOrderById, cancelOrder, updateOrderStatus, fetchAllOrders, confirmPurchase } from '../api/orderApi'

// 주문 생성 Thunk
export const createOrderThunk = createAsyncThunk('order/createOrder', async (orderData, { rejectWithValue }) => {
   try {
      const response = await createOrder(orderData)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '주문 생성 실패')
   }
})

// 주문 목록 조회 Thunk
export const fetchOrdersThunk = createAsyncThunk('order/fetchOrders', async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
   try {
      const response = await getOrders({ page, limit })
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '주문 목록 조회 실패')
   }
})

// 주문 상세 조회 Thunk
export const fetchOrderByIdThunk = createAsyncThunk('order/fetchOrderById', async (orderId, { rejectWithValue }) => {
   try {
      const response = await getOrderById(orderId)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '주문 상세 조회 실패')
   }
})

// 주문 취소 Thunk
export const cancelOrderThunk = createAsyncThunk('order/cancelOrder', async (orderId, { rejectWithValue }) => {
   try {
      const response = await cancelOrder(orderId)
      return { orderId, message: response.data.message }
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '주문 취소 실패')
   }
})

// 주문 상태 변경 Thunk
export const updateOrderStatusThunk = createAsyncThunk('order/updateOrderStatus', async ({ orderId, status }, { rejectWithValue }) => {
   try {
      const response = await updateOrderStatus(orderId, status)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '주문 상태 변경 실패')
   }
})

// 구매 확정 Thunk
export const confirmPurchaseThunk = createAsyncThunk('order/confirmPurchase', async (orderId, { rejectWithValue }) => {
   try {
      const response = await confirmPurchase(orderId)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '구매 확정 실패')
   }
})

//관리자용 전체 주문 조회 Thunk
export const fetchAllOrdersThunk = createAsyncThunk('order/fetchAllOrders', async (sort, { rejectWithValue }) => {
   try {
      const response = await fetchAllOrders(sort)
      return response.data
   } catch (error) {
      if (error.response?.status === 404) {
         return { orders: [], pagination: null }
      }
      return rejectWithValue(error.response?.data?.message || '주문 조회 실패')
   }
})

const orderSlice = createSlice({
   name: 'order',
   initialState: {
      orders: [],
      orderDetail: null,
      loading: false,
      error: null,
      successMessage: null,
      pagination: null,
   },
   reducers: {
      clearOrderMessages(state) {
         state.successMessage = null
         state.error = null
      },
   },
   extraReducers: (builder) => {
      // 주문 생성
      builder
         .addCase(createOrderThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(createOrderThunk.fulfilled, (state, action) => {
            state.loading = false
            state.successMessage = '주문이 완료되었습니다.'
            state.orders.push(action.payload)
         })
         .addCase(createOrderThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 주문 목록 조회
         .addCase(fetchOrdersThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
            state.loading = false
            state.orders = action.payload.orders
            state.pagination = action.payload.pagination
         })
         .addCase(fetchOrdersThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 주문 상세 조회
         .addCase(fetchOrderByIdThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchOrderByIdThunk.fulfilled, (state, action) => {
            state.loading = false
            state.orderDetail = action.payload
         })
         .addCase(fetchOrderByIdThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 주문 취소
         .addCase(cancelOrderThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(cancelOrderThunk.fulfilled, (state, action) => {
            state.loading = false
            state.successMessage = action.payload.message
            // 취소된 주문 상태 업데이트
            state.orders = state.orders.map((order) => (order.id === action.payload.orderId ? { ...order, orderStatus: 'CANCEL' } : order))
         })
         .addCase(cancelOrderThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         //주문 상태 변경
         .addCase(updateOrderStatusThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            state.orders = action.payload
         })
         .addCase(updateOrderStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 관리자용 전체 주문 조회
         .addCase(fetchAllOrdersThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(fetchAllOrdersThunk.fulfilled, (state, action) => {
            state.loading = false
            state.orders = action.payload.orders
         })
         .addCase(fetchAllOrdersThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 구매 확정
         .addCase(confirmPurchaseThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(confirmPurchaseThunk.fulfilled, (state, action) => {
            state.loading = false
            state.successMessage = action.payload.message
            // 구매 확정된 주문 상태 업데이트
            state.orders = state.orders.map((order) =>
               order.id === action.payload.order.id ? { ...order, isPurchaseConfirmed: true } : order
            )
         })
         .addCase(confirmPurchaseThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})

export const { clearOrderMessages } = orderSlice.actions
export default orderSlice.reducer
