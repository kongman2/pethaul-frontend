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

   // URL 파라미터에서 에러 확인
   useEffect(() => {
      if (pathname === '/login') {
         const searchParams = new URLSearchParams(location.search)
         const error = searchParams.get('error')
         
         if (error) {
            
            let errorMessage = '로그인에 실패했습니다.'
            
            switch (error) {
               case 'google_auth_failed':
                  errorMessage = 'Google 로그인에 실패했습니다. 서버 로그를 확인하거나 다시 시도해주세요.'
                  break
               case 'google_auth_failed:redirect_uri_mismatch':
                  errorMessage = 'Google OAuth 설정 오류: Redirect URI가 일치하지 않습니다. 관리자에게 문의하세요.'
                  break
               case 'google_auth_failed:invalid_client':
                  errorMessage = 'Google OAuth 설정 오류: Client ID 또는 Secret이 잘못되었습니다. 관리자에게 문의하세요.'
                  break
               case 'google_auth_failed:invalid_grant':
                  errorMessage = 'Google OAuth 토큰 교환 실패. 다시 시도해주세요.'
                  break
               case 'google_strategy_not_found':
                  errorMessage = 'Google OAuth가 설정되지 않았습니다. 관리자에게 문의하세요.'
                  break
               case 'session_failed':
                  errorMessage = '세션 설정에 실패했습니다. 다시 시도해주세요.'
                  break
               case 'access_denied':
                  errorMessage = 'Google 로그인 권한이 거부되었습니다.'
                  break
               default:
                  if (error?.startsWith('google_auth_failed:')) {
                     errorMessage = `Google 로그인 오류: ${error.split(':')[1]}. 관리자에게 문의하세요.`
                  } else {
                     errorMessage = `로그인 중 오류가 발생했습니다. (${error})`
                  }
            }
            
            toast.error(errorMessage, {
               position: 'top-center',
               autoClose: 5000,
            })
            
            // URL에서 error 파라미터 제거
            const newSearchParams = new URLSearchParams(location.search)
            newSearchParams.delete('error')
            const newSearch = newSearchParams.toString()
            navigate(`${pathname}${newSearch ? `?${newSearch}` : ''}`, { replace: true })
         }
      }
   }, [pathname, location.search, navigate])

   useEffect(() => {
      if (pathname === '/google-success') {
         // URL 파라미터에서 토큰 확인
         const searchParams = new URLSearchParams(location.search)
         const token = searchParams.get('token')
         
         // 토큰이 있으면 저장하고 인증 상태 확인
         if (token) {
            localStorage.setItem('token', token)
            
            // 토큰 저장 후 세션이 설정될 때까지 잠시 대기 (크로스 도메인 리다이렉트로 인한 지연 고려)
            // 그 후 인증 상태 확인
            setTimeout(() => {
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
                        // 세션 확인 실패 시 재시도 (세션이 아직 설정되지 않았을 수 있음)
                        setTimeout(() => {
                           dispatch(checkUnifiedAuthThunk())
                              .unwrap()
                              .then((retryResult) => {
                                 if (retryResult?.isAuthenticated) {
                                    toast.success('구글 로그인에 성공했습니다.', {
                                       position: 'top-center',
                                       autoClose: 2000,
                                    })
                                    setTimeout(() => {
                                       navigate('/')
                                    }, 2000)
                                 } else {
                                    // 재시도도 실패 - 토큰은 있지만 세션이 설정되지 않음
                                    toast.error('인증 확인에 실패했습니다. 다시 시도해주세요.', {
                                       position: 'top-center',
                                       autoClose: 2000,
                                    })
                                    setTimeout(() => {
                                       navigate('/login')
                                    }, 2000)
                                 }
                              })
                              .catch((retryError) => {
                                 toast.error('인증 확인 중 오류가 발생했습니다.', {
                                    position: 'top-center',
                                    autoClose: 2000,
                                 })
                                 setTimeout(() => {
                                    navigate('/login')
                                 }, 2000)
                              })
                        }, 1000) // 1초 후 재시도
                     }
                  })
                  .catch((error) => {
                     toast.error('인증 확인 중 오류가 발생했습니다.', {
                        position: 'top-center',
                        autoClose: 2000,
                     })
                     setTimeout(() => {
                        navigate('/login')
                     }, 2000)
                  })
            }, 500) // 500ms 대기 후 인증 확인
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

