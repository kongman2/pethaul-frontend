import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { toast } from 'react-toastify'

import useAppBackground from '../../hooks/useAppBackground'
import { checkUnifiedAuthThunk } from '../../features/authSlice'

import FindFormBase from '../../components/auth/FindFormBase'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'

function AuthPage() {
   useAppBackground('app-bg--blue')
   const location = useLocation()
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const pathname = location.pathname

   useEffect(() => {
      if (pathname === '/google-success') {
         // URL 파라미터에서 토큰 확인
         const searchParams = new URLSearchParams(location.search)
         const token = searchParams.get('token')
         
         // 토큰이 있으면 저장하고 인증 상태 확인
         if (token) {
            localStorage.setItem('token', token)
            console.log('✅ 구글 로그인 응답에서 JWT 토큰을 받아 저장했습니다.')
            
            // 토큰 저장 후 Redux 상태 업데이트를 위해 인증 상태 확인
            dispatch(checkUnifiedAuthThunk())
               .unwrap()
               .then((result) => {
                  if (result?.isAuthenticated) {
                     toast.success('구글 로그인에 성공했습니다.', {
                        position: 'top-center',
                        autoClose: 2000,
                     })
                     setTimeout(() => {
                        navigate('/')
                     }, 2000)
                  } else {
                     // 토큰은 있지만 인증 확인 실패 - 토큰이 유효하지 않을 수 있음
                     console.warn('⚠️ 토큰은 있지만 인증 확인에 실패했습니다.')
                     toast.error('인증 확인에 실패했습니다. 다시 시도해주세요.', {
                        position: 'top-center',
                        autoClose: 2000,
                     })
                     setTimeout(() => {
                        navigate('/login')
                     }, 2000)
                  }
               })
               .catch((error) => {
                  console.error('구글 로그인 인증 확인 실패:', error)
                  toast.error('인증 확인 중 오류가 발생했습니다.', {
                     position: 'top-center',
                     autoClose: 2000,
                  })
                  setTimeout(() => {
                     navigate('/login')
                  }, 2000)
               })
            return
         }
         
         // 토큰이 없으면 인증 상태 확인 (세션 기반)
         dispatch(checkUnifiedAuthThunk())
            .unwrap()
            .then((result) => {
               if (result?.isAuthenticated) {
                  toast.success('구글 로그인에 성공했습니다.', {
                     position: 'top-center',
                     autoClose: 2000,
                  })
                  setTimeout(() => {
                     navigate('/')
                  }, 2000)
               } else {
                  toast.error('인증 확인에 실패했습니다. 다시 시도해주세요.', {
                     position: 'top-center',
                     autoClose: 2000,
                  })
                  setTimeout(() => {
                     navigate('/login')
                  }, 2000)
               }
            })
            .catch((error) => {
               console.error('구글 로그인 인증 확인 실패:', error)
               toast.error('인증 확인 중 오류가 발생했습니다.', {
                  position: 'top-center',
                  autoClose: 2000,
               })
               setTimeout(() => {
                  navigate('/login')
               }, 2000)
            })
      }
   }, [pathname, navigate, dispatch, location.search])

   // GoogleSuccessPage 렌더링
   if (pathname === '/google-success') {
      return <p>로그인 성공! 홈으로 이동 중...</p>
   }

   // 나머지 페이지들은 공통 레이아웃
   return (
      <div className='container d-flex align-items-center'>
         {pathname === '/login' && <LoginForm />}
         {pathname === '/join' && <RegisterForm />}
         {pathname === '/find-id' && <FindFormBase mode='id' />}
         {pathname === '/find-password' && <FindFormBase mode='pw' />}
      </div>
   )
}

export default AuthPage

