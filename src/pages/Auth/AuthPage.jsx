import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import useAppBackground from '../../hooks/useAppBackground'

import FindFormBase from '../../components/auth/FindFormBase'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'

function AuthPage() {
   useAppBackground('app-bg--blue')
   const location = useLocation()
   const navigate = useNavigate()
   const pathname = location.pathname

   useEffect(() => {
      if (pathname === '/google-success') {
         toast.success('구글 로그인에 성공했습니다.', {
            position: 'top-center',
            autoClose: 2000,
         })

         // 홈으로 2초 후 이동
         const timer = setTimeout(() => {
            navigate('/')
         }, 2000)

         return () => clearTimeout(timer)
      }
   }, [pathname, navigate])

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

