import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  fetchContentsApi,
  fetchContentByIdApi,
  createContentApi,
  updateContentApi,
  deleteContentApi,
  uploadContentImageApi, // 단독 URL 발급만 사용
} from '../api/contentApi'

/** 목록 조회
 *  params: { page=1, size=10, tag, q } */
export const fetchContentsThunk = createAsyncThunk(
  'content/fetchList',
  async (params, { rejectWithValue }) => {
    try {
      return await fetchContentsApi(params)
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

/** 단건 조회 */
export const fetchContentByIdThunk = createAsyncThunk(
  'content/fetchOne',
  async (id, { rejectWithValue }) => {
    try {
      return await fetchContentByIdApi(id)
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

/** 생성(관리자) */
export const createContentThunk = createAsyncThunk(
  'content/create',
  async (payload, { rejectWithValue }) => {
    try {
      return await createContentApi(payload)
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

/** 수정(관리자) */
export const updateContentThunk = createAsyncThunk(
  'content/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      return await updateContentApi(id, payload)
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

/** 삭제(관리자) */
export const deleteContentThunk = createAsyncThunk(
  'content/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteContentApi(id)
      return id
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

/** 이미지 업로드(단독 URL 발급) */
export const uploadContentImageThunk = createAsyncThunk(
  'content/uploadImage',
  async (file, { rejectWithValue }) => {
    try {
      // 기대 응답: { url: 'http://.../uploads/xxx.png' }
      return await uploadContentImageApi(file)
    } catch (e) {
      return rejectWithValue(e?.response?.data || e.message)
    }
  }
)

const initialState = {
  list: [],
  posts: [],        // hero + list
  page: 1,
  size: 10,
  total: 0,
  hasMore: true,
  hero: null,       // 상단 큰 1개
  current: null,    // 상세
  loading: false,
  error: null,

  // 업로드 전용 상태
  uploading: false,
  uploadError: null,
}

const rebuildPosts = (state) => {
  state.posts = state.hero ? [state.hero, ...state.list] : [...state.list]
}

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    resetContentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      /** ===== 목록 ===== */
      .addCase(fetchContentsThunk.pending, (s) => {
        s.loading = true
        s.error = null
      })
      .addCase(fetchContentsThunk.fulfilled, (s, { payload }) => {
        const { list = [], page = 1, size = s.size, total = 0, hasMore = false } = payload || {}
        const isFirstPage = page === 1

        // 메타 업데이트
        s.page = page
        s.size = size
        s.total = total
        s.hasMore = hasMore

        if (!Array.isArray(list) || list.length === 0) {
          if (isFirstPage) {
            s.hero = null
            s.list = []
          }
          s.loading = false
          rebuildPosts(s)
          return
        }

        if (isFirstPage) {
          // 1페이지: featured 우선 hero, 없으면 첫 항목
          const idx = list.findIndex((p) => p?.isFeatured)
          if (idx !== -1) {
            s.hero = list[idx] || null
            s.list = list.filter((_, i) => i !== idx)
          } else {
            s.hero = list[0] || null
            s.list = list.slice(1)
          }
        } else {
          // 2페이지+: hero 유지, 리스트에 append(중복 제거, hero는 제외)
          const byId = new Map(s.list.map((p) => [p.id, p]))
          for (const item of list) {
            if (!item) continue
            if (item.id === s.hero?.id) continue
            byId.set(item.id, item)
          }
          s.list = Array.from(byId.values())
        }

        s.loading = false
        rebuildPosts(s)
      })
      .addCase(fetchContentsThunk.rejected, (s, { payload }) => {
        s.loading = false
        s.error = payload || '목록을 불러오지 못했습니다.'
      })

      /** ===== 단건 ===== */
      .addCase(fetchContentByIdThunk.pending, (s) => {
        s.loading = true
        s.error = null
      })
      .addCase(fetchContentByIdThunk.fulfilled, (s, { payload }) => {
        s.current = payload || null
        s.loading = false
      })
      .addCase(fetchContentByIdThunk.rejected, (s, { payload }) => {
        s.loading = false
        s.error = payload || '상세를 불러오지 못했습니다.'
      })

      /** ===== 생성 ===== */
      .addCase(createContentThunk.fulfilled, (s, { payload }) => {
        if (!payload) return
        if (payload.isFeatured) {
          s.hero = payload
        } else if (!s.list.some((p) => p.id === payload.id)) {
          s.list.unshift(payload)
        }
        s.total = (s.total || 0) + 1
        rebuildPosts(s)
      })

      /** ===== 수정 ===== */
      .addCase(updateContentThunk.fulfilled, (s, { payload }) => {
        if (!payload) return
        if (s.current?.id === payload.id) s.current = payload
        if (s.hero?.id === payload.id) s.hero = payload
        s.list = s.list.map((p) => (p.id === payload.id ? payload : p))
        rebuildPosts(s)
      })

      /** ===== 삭제 ===== */
      .addCase(deleteContentThunk.fulfilled, (s, { payload: id }) => {
        s.list = s.list.filter((p) => p.id !== id)
        if (s.hero?.id === id) s.hero = null
        if (s.current?.id === id) s.current = null
        s.total = Math.max(0, (s.total || 0) - 1)
        rebuildPosts(s)
      })

      /** ===== 이미지 업로드 상태 (단독 URL 발급) ===== */
      .addCase(uploadContentImageThunk.pending, (s) => {
        s.uploading = true
        s.uploadError = null
      })
      .addCase(uploadContentImageThunk.fulfilled, (s) => {
        s.uploading = false
      })
      .addCase(uploadContentImageThunk.rejected, (s, { payload }) => {
        s.uploading = false
        s.uploadError = payload || '이미지 업로드에 실패했습니다.'
      })
  },
})

export const { resetContentState } = contentSlice.actions
export default contentSlice.reducer

/** ===== Selectors ===== */
export const selectContentHero = (s) => s.content.hero
export const selectContentList = (s) => s.content.list
export const selectContentPosts = (s) => s.content.posts
export const selectContentPaging = (s) => ({
  page: s.content.page,
  size: s.content.size,
  total: s.content.total,
  hasMore: s.content.hasMore,
})
export const selectContentLoading = (s) => s.content.loading
export const selectContentError = (s) => s.content.error
export const selectContentUploading = (s) => s.content.uploading
export const selectContentUploadError = (s) => s.content.uploadError
