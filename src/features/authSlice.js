import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

import { registerUser, loginUser, logoutUser, checkAuthStatus, googleLoginUser, googleCheckStatus, findId, updatePassword, updateMyInfo, verifyPassword } from '../api/authApi'
import { getTokenThunk } from './tokenSlice'
const normalizeAuthPayload = (raw) => {
   // 허용 형태: axios res, res.data, 혹은 이미 얕은 객체
   const p = raw?.data ?? raw ?? {}
   const hasLocal = typeof p.isAuthenticated === 'boolean'
   const hasGoogle = typeof p.googleAuthenticated === 'boolean'

   let user = p.user ?? null
   let isAuthenticated = false
   let googleAuthenticated = false

   if (hasLocal) {
      isAuthenticated = !!p.isAuthenticated
   }
   if (hasGoogle) {
      googleAuthenticated = !!p.googleAuthenticated
      // 구글 응답이 사용자 정보를 동봉할 수도 있음
      if (!user && p.user) user = p.user
   }

   return {
      user,
      isAuthenticated: isAuthenticated || googleAuthenticated,
      googleAuthenticated,
   }
}

// -----------------------------
// Thunks: 기존 유지 (API 래퍼)
// -----------------------------
// 구글 로그인(DB 저장 전용)
export const googleLoginUserThunk = createAsyncThunk('auth/googleLoginUser', async (googleData, { rejectWithValue }) => {
   try {
      const response = await googleLoginUser(googleData)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '구글 로그인 실패')
   }
})

// 구글 로그인 상태 확인
export const googleCheckStatusThunk = createAsyncThunk('auth/googleCheckStatus', async (_, { rejectWithValue }) => {
   try {
      const response = await googleCheckStatus()
      return response // 백엔드가 data를 감싸든 말든 normalize에서 처리
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '구글 로그인 상태 확인 실패')
   }
})

// 회원가입
export const registerUserThunk = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
   try {
      const response = await registerUser(userData)
      return response.data.user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원가입 실패')
   }
})

// 로그인
export const loginUserThunk = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue, dispatch }) => {
   try {
      const response = await loginUser(credentials)
      const user = response.data.user
      
      // 로그인 성공 후 자동으로 JWT 토큰 발급
      // 세션이 완전히 설정될 때까지 약간의 지연 후 시도
      // 토큰 발급은 선택적이므로 실패해도 로그인은 성공으로 처리
      try {
         // 세션이 완전히 설정될 때까지 충분한 지연 (500ms)
         await new Promise(resolve => setTimeout(resolve, 500))
         
         // 먼저 세션 상태 확인 (user 객체가 있는지 확인)
         const { checkAuthStatus } = await import('../api/authApi')
         const authCheck = await checkAuthStatus()
         
         // 세션이 있고 user 객체가 있을 때만 토큰 발급 시도
         if (authCheck.data?.isAuthenticated && authCheck.data?.user?.id) {
            // 최대 5번까지 재시도 (더 많은 기회 제공)
            let tokenResult = null
            for (let attempt = 0; attempt < 5; attempt++) {
               tokenResult = await dispatch(getTokenThunk())
               if (tokenResult.type === 'token/getToken/fulfilled' && tokenResult.payload) {
                  localStorage.setItem('token', tokenResult.payload)
                  console.log('✅ JWT 토큰이 자동으로 발급되어 저장되었습니다.')
                  break
               }
               // 실패 시 점진적으로 대기 시간 증가 (300ms, 500ms, 700ms, 1000ms)
               if (attempt < 4) {
                  const delay = 300 + (attempt * 200)
                  await new Promise(resolve => setTimeout(resolve, delay))
               }
            }
            
            // 모든 시도 실패 시 조용히 처리 (토큰 없이도 세션 기반으로 작동 가능)
            if (tokenResult?.type !== 'token/getToken/fulfilled') {
               console.debug('토큰 자동 발급 실패 (세션 기반 인증으로 계속 사용 가능)')
            }
         } else {
            // 세션이 없거나 user 객체가 없으면 토큰 발급 불가능
            console.debug('세션 또는 사용자 정보가 없어 토큰 발급을 건너뜁니다.')
         }
      } catch (tokenError) {
         // 예외 발생 시에도 로그인은 성공으로 처리 (세션 기반 인증으로 작동 가능)
         console.debug('토큰 자동 발급 중 예외 발생 (무시됨):', tokenError.message)
      }
      
      return user
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그인 실패')
   }
})

// 로그아웃
export const logoutUserThunk = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
   try {
      const response = await logoutUser()
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그아웃 실패')
   }
})

// 로그인 상태 확인
export const checkAuthStatusThunk = createAsyncThunk('auth/checkAuthStatus', async (_, { rejectWithValue }) => {
   try {
      const response = await checkAuthStatus()
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '로그인 상태 확인 실패')
   }
})

// 아이디 찾기 (로컬 회원)
export const findIdThunk = createAsyncThunk('auth/findId', async (phoneNumber, { rejectWithValue }) => {
   try {
      const response = await findId(phoneNumber)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원 정보 확인 실패')
   }
})

// 임시 비밀번호 발급 (로컬 회원)
export const updatePasswordThunk = createAsyncThunk('auth/updatePassword', async ({ userId, phoneNumber }, { rejectWithValue }) => {
   try {
      const response = await updatePassword({ userId, phoneNumber })
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원 정보 확인 실패')
   }
})

// 회원 정보 수정
export const updateMyInfoThunk = createAsyncThunk('auth/updateMyInfo', async (data, { rejectWithValue }) => {
   try {
      const response = await updateMyInfo(data)

      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '회원 정보 수정 실패')
   }
})

//비밀번호 확인
export const verifyPasswordThunk = createAsyncThunk('auth/verifyPassword', async (password, { rejectWithValue }) => {
   try {
      const response = await verifyPassword(password)
      return response.data
   } catch (error) {
      return rejectWithValue(error.response?.data?.message || '비밀번호 확인 실패')
   }
})

export const checkUnifiedAuthThunk = createAsyncThunk('auth/checkUnified', async (_, { dispatch }) => {
   const [localRes, googleRes] = await Promise.allSettled([dispatch(checkAuthStatusThunk()).unwrap(), dispatch(googleCheckStatusThunk()).unwrap()])

   const localOk = localRes.status === 'fulfilled' ? normalizeAuthPayload(localRes.value) : null
   const googleOk = googleRes.status === 'fulfilled' ? normalizeAuthPayload(googleRes.value) : null

   // 우선순위: 인증 true인 결과들 중 사용자 정보가 있는 쪽 우선
   const candidates = [localOk, googleOk].filter(Boolean)
   const authed = candidates.filter((c) => c.isAuthenticated)

   if (authed.length > 0) {
      authed.sort((a, b) => (b.user ? 1 : 0) - (a.user ? 1 : 0))
      
      // 인증된 사용자인데 토큰이 없으면 자동으로 발급 시도
      const token = localStorage.getItem('token')
      if (!token) {
         try {
            // 세션이 완전히 설정될 때까지 충분한 지연 (500ms)
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // user 객체가 있는지 확인 (authed[0]에 이미 있음)
            if (authed[0]?.user?.id) {
               // 최대 5번까지 재시도 (더 많은 기회 제공)
               const { getTokenThunk } = await import('./tokenSlice')
               let tokenResult = null
               for (let attempt = 0; attempt < 5; attempt++) {
                  tokenResult = await dispatch(getTokenThunk())
                  if (tokenResult.type === 'token/getToken/fulfilled' && tokenResult.payload) {
                     localStorage.setItem('token', tokenResult.payload)
                     console.log('✅ 인증 상태 확인 후 JWT 토큰이 자동으로 발급되었습니다.')
                     break
                  }
                  // 실패 시 점진적으로 대기 시간 증가 (300ms, 500ms, 700ms, 1000ms)
                  if (attempt < 4) {
                     const delay = 300 + (attempt * 200)
                     await new Promise(resolve => setTimeout(resolve, delay))
                  }
               }
               
               // 모든 시도 실패 시 조용히 처리 (토큰 없이도 세션 기반으로 작동 가능)
               if (tokenResult?.type !== 'token/getToken/fulfilled') {
                  console.debug('토큰 자동 발급 실패 (세션 기반 인증으로 계속 사용 가능)')
               }
            } else {
               // user 객체가 없으면 토큰 발급 불가능
               console.debug('사용자 정보가 없어 토큰 발급을 건너뜁니다.')
            }
         } catch (tokenError) {
            // 예외 발생 시에도 조용히 처리 (세션 기반 인증으로 작동 가능)
            console.debug('토큰 자동 발급 중 예외 발생 (무시됨):', tokenError.message)
         }
      }
      
      return { ...authed[0], uncertain: false }
   }

   // 둘 다 실패 혹은 둘 다 비로그인
   // 네트워크 불안정 같은 경우를 위해 불확실 플래그 제공
   const anyRejected = localRes.status === 'rejected' || googleRes.status === 'rejected'
   return { user: null, isAuthenticated: false, googleAuthenticated: false, uncertain: anyRejected }
})

// -----------------------------
// Slice
// -----------------------------
const authSlice = createSlice({
   name: 'auth',
   initialState: {
      user: null,
      ids: [],
      isAuthenticated: false,
      googleAuthenticated: false,
      loading: false,
      error: null,
      verified: false,
   },
   reducers: {
      resetFindId(state) {
         state.ids = []
      },
   },
   extraReducers: (builder) => {
      builder
         // 회원가입
         .addCase(registerUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(registerUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload
         })
         .addCase(registerUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 일반 로그인
         .addCase(loginUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(loginUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload
         })
         .addCase(loginUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 구글 로그인
         .addCase(googleLoginUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(googleLoginUserThunk.fulfilled, (state, action) => {
            state.loading = false
            state.isAuthenticated = true
            state.user = action.payload
            state.googleAuthenticated = true
         })
         .addCase(googleLoginUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         // 로그아웃 — 명시적일 때만 비인증 처리
         .addCase(logoutUserThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(logoutUserThunk.fulfilled, (state) => {
            state.loading = false
            state.isAuthenticated = false
            state.user = null
            state.googleAuthenticated = false
         })
         .addCase(logoutUserThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })

         .addCase(googleCheckStatusThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(googleCheckStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            const norm = normalizeAuthPayload(action.payload)
            // 통합 체크가 없다면 단독으로도 합리적으로 동작
            state.isAuthenticated = norm.isAuthenticated
            state.user = norm.user
            state.googleAuthenticated = norm.googleAuthenticated
         })
         .addCase(googleCheckStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            // 여기서 상태를 강제로 false로 만들지 않는다
         })

         .addCase(checkAuthStatusThunk.pending, (state) => {
            state.loading = true
         })
         .addCase(checkAuthStatusThunk.fulfilled, (state, action) => {
            state.loading = false
            const norm = normalizeAuthPayload(action.payload)
            state.isAuthenticated = norm.isAuthenticated
            state.user = norm.user
         })
         .addCase(checkAuthStatusThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
            // 여기서도 강제 false 처리 금지
         })

         .addCase(checkUnifiedAuthThunk.pending, (state) => {
            state.loading = true
         })
         .addCase(checkUnifiedAuthThunk.fulfilled, (state, action) => {
            state.loading = false
            const { user, isAuthenticated, googleAuthenticated, uncertain } = action.payload
            if (uncertain && state.isAuthenticated) {
               // 네트워크 등 불확실 상황에서는 기존 true 상태를 보존
               return
            }
            state.isAuthenticated = isAuthenticated
            state.user = user
            state.googleAuthenticated = !!googleAuthenticated
         })
         .addCase(checkUnifiedAuthThunk.rejected, (state) => {
            state.loading = false
            // rejected 시에도 기존 인증 상태 유지 (네트워크 오류 등)
         })
         // 아이디 찾기
         .addCase(findIdThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(findIdThunk.fulfilled, (state, action) => {
            state.loading = false
            state.ids = action.payload.ids
         })
         .addCase(findIdThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 회원 정보 수정
         .addCase(updateMyInfoThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(updateMyInfoThunk.fulfilled, (state, action) => {
            state.loading = false
            state.user = action.payload.user
         })
         .addCase(updateMyInfoThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
         // 비밀번호 확인
         .addCase(verifyPasswordThunk.pending, (state) => {
            state.loading = true
            state.error = null
         })
         .addCase(verifyPasswordThunk.fulfilled, (state) => {
            state.loading = false
            state.verified = true
         })
         .addCase(verifyPasswordThunk.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
         })
   },
})
export const { resetFindId } = authSlice.actions
export default authSlice.reducer
