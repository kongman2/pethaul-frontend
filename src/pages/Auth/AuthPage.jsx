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
         // 인증 상태 확인
         dispatch(checkUnifiedAuthThunk())
            .unwrap()
            .then(() => {
               toast.success('구글 로그인에 성공했습니다.', {
                  position: 'top-center',
                  autoClose: 2000,
               })

               // 홈으로 2초 후 이동
               setTimeout(() => {
                  navigate('/')
               }, 2000)
            })
            .catch(() => {
               toast.error('인증 확인 중 오류가 발생했습니다.', {
                  position: 'top-center',
                  autoClose: 2000,
               })
               setTimeout(() => {
                  navigate('/login')
               }, 2000)
            })
      }
   }, [pathname, navigate, dispatch])

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

