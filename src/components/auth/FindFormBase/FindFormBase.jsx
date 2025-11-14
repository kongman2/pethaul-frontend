import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Form } from 'react-bootstrap'

import { findIdThunk, updatePasswordThunk, resetFindId } from '../../../features/authSlice'

import { Input, Button } from '../../common'
import AuthFormLayout from '../AuthFormLayout'
import useAppBackground from '../../../hooks/useAppBackground'
import 발바닥Img from '../../../assets/발바닥.png'

function FindFormBase({ mode }) {
   useAppBackground('app-bg--ribbon')
   const dispatch = useDispatch()
   const { ids, loading } = useSelector((state) => state.auth)
   const [inputId, setInputId] = useState('')
   const [phoneNumber, setPhoneNumber] = useState('')
   const [tempPassword, setTempPassword] = useState('')
   const [error, setError] = useState('')

   useEffect(() => {
      return () => {
         dispatch(resetFindId())
         setError('')
      }
   }, [dispatch])

   const handleFindId = () => {
      dispatch(findIdThunk(phoneNumber))
         .unwrap()
         .then(() => setError(''))
         .catch((error) => {
            dispatch(resetFindId())
            setError(error)
         })
   }

   const handleUpdatePw = () => {
      dispatch(updatePasswordThunk({ userId: inputId, phoneNumber }))
         .unwrap()
         .then((res) => {
            setTempPassword(res.tempPassword)
            setError('')
         })
         .catch((error) => {
            setTempPassword(null)
            setError(error)
         })
   }

   const title = mode === 'id' ? 'ID 찾기' : '임시 비밀번호 발급받기'

   return (
      <AuthFormLayout title={title} iconSrc={발바닥Img}>
         <div className="d-flex flex-column gap-4">
            {/* 입력 섹션 */}
            <div className="d-flex flex-column gap-3">
               {mode === 'pw' && (
                  <div className="d-flex flex-column gap-2">
                     <label className="form-label text-start" htmlFor="find-id">ID</label>
                     <Input
                        type="text"
                        name="id"
                        value={inputId}
                        onChange={setInputId}
                        placeholder="ID를 입력하세요."
                        id="find-id"
                        className="w-100"
                        variant="auth"
                     />
                  </div>
               )}

               <div className="d-flex flex-column gap-2">
                  <label className="form-label text-start" htmlFor="find-phone">핸드폰 번호</label>
                  <Input
                     type="tel"
                     name="phone"
                     value={phoneNumber}
                     onChange={setPhoneNumber}
                     placeholder="숫자만 입력하세요."
                     id="find-phone"
                     className="w-100"
                     variant="auth"
                  />
               </div>
            </div>

            {/* 로딩 상태 */}
            {loading && <p className="text-center mb-0">회원 정보 조회 중...</p>}

            {/* 버튼 섹션 */}
            <div className="d-flex flex-column gap-3">
               {mode === 'id' && (
                  <Button 
                     variant="auth-primary" 
                     type="button" 
                     size="lg"
                     onClick={handleFindId}
                     disabled={loading}
                  >
                     ID 찾기
                  </Button>
               )}

               {mode === 'pw' && (
                  <Button 
                     variant="auth-primary" 
                     type="button" 
                     size="lg"
                     onClick={handleUpdatePw}
                     disabled={loading}
                  >
                     임시 비밀번호 발급받기
                  </Button>
               )}
            </div>

            {/* 에러 메시지 */}
            {error && (
               <div className="d-flex flex-column gap-3 align-items-center">
                  <Alert variant="danger" className="w-100 mb-0">{String(error)}</Alert>
                  <div className="find-section d-flex flex-wrap justify-content-center">
                     {mode === 'pw' && <Link className="find-link" to="/find-id">ID 찾기</Link>}
                     <Link className="find-link" to="/join">회원가입</Link>
                  </div>
               </div>
            )}

            {/* ID 찾기 결과 */}
            {ids.length > 0 && (
               <div className="find-result p-4 bg-light rounded-3 d-flex flex-column gap-3 align-items-center">
                  <p className="fw-bold mb-0">{ids.length}개의 아이디를 찾았습니다.</p>
                  <ul className="list-unstyled mb-0">
                     {ids.map((id, index) => (
                        <li key={index} className="py-2 text-center">
                           <strong>{id}</strong>
                        </li>
                     ))}
                  </ul>
                  <div className="find-section d-flex flex-wrap justify-content-center">
                     <Link className="find-link" to="/find-password">비밀번호 찾기</Link>
                     <Link className="find-link" to="/login">로그인 하러 가기</Link>
                  </div>
               </div>
            )}

            {/* 임시 비밀번호 발급 결과 */}
            {tempPassword && (
               <div className="find-result p-4 bg-light rounded-3 d-flex flex-column gap-3 align-items-center">
                  <p className="fw-bold mb-0">임시 비밀번호가 발급되었습니다.</p>
                  <Form.Control 
                     type="text" 
                     value={tempPassword} 
                     readOnly 
                     className="text-center fw-bold"
                  />
                  <p className="text-center text-muted small mb-0">
                     임시 비밀번호는 30분간 유효합니다. <br />
                     로그인 후 반드시 마이페이지 → 회원 정보 수정 페이지에서 <br />
                     비밀번호를 변경해 주세요.
                  </p>
                  <div className="find-section d-flex flex-wrap justify-content-center">
                     <Link className="find-link" to="/login">로그인 하러 가기</Link>
                  </div>
               </div>
            )}
         </div>
      </AuthFormLayout>
   )
}

export default FindFormBase
