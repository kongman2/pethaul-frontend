import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { deletePetThunk, getUserPetsThunk } from '../../features/petSlice'
import { getUserReviewThunk } from '../../features/reviewSlice'
import { fetchOrdersThunk } from '../../features/orderSlice'

import Profile from '../../components/My/Profile/Profile'
import OrderState from '../../components/My/OrderState/OrderState'
import MenuBar from '../../components/My/MenuBar/MenuBar'
import { SectionCard, PageHeader, AlertModal } from '../../components/common'
import { useModalHelpers } from '../../hooks/useModalHelpers'
import PetProfileSlider from '../../components/slider/PetProfileSlider'
import useAppBackground from '../../hooks/useAppBackground'

function MyPage() {
  useAppBackground('app-bg--dots')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading: userLoading } = useSelector((state) => state.auth)
  const { alert, alertModal } = useModalHelpers()
  const { pets } = useSelector((state) => state.pet)
  const { orders } = useSelector((state) => state.order)
  const hasInitializedRef = useRef(false)
  const lastUserIdRef = useRef(null)
  const isFetchingRef = useRef(false)

  // userId를 직접 추출 (메모이제이션 제거 - 값이 실제로 변경될 때만 useEffect 실행)
  const userId = user?.id ?? user?._id ?? user?.userId ?? null

  useEffect(() => {
    // userId가 없으면 스킵
    if (!userId) {
      lastUserIdRef.current = null
      hasInitializedRef.current = false
      isFetchingRef.current = false
      return
    }

    // userId가 실제로 변경되었는지 확인
    const currentUserId = String(userId)
    const lastUserId = lastUserIdRef.current ? String(lastUserIdRef.current) : null

    // userId가 변경되지 않았고 이미 초기화했으면 스킵
    if (lastUserId === currentUserId && hasInitializedRef.current) {
      return
    }

    // 현재 fetch 중이면 스킵 (무한 루프 방지)
    if (isFetchingRef.current) {
      return
    }

    // userId가 변경되었으면 리셋
    if (lastUserId !== currentUserId) {
      hasInitializedRef.current = false
      lastUserIdRef.current = currentUserId
    }

    // 한 번만 실행되도록 가드
    if (hasInitializedRef.current) return
    
    hasInitializedRef.current = true
    isFetchingRef.current = true
    
    // 모든 데이터를 한 번에 fetch (checkAuthStatusThunk는 App.jsx에서 이미 호출하므로 제외)
    Promise.allSettled([
      dispatch(getUserPetsThunk()),
      dispatch(getUserReviewThunk({ page: 1, limit: 100 })),
      dispatch(fetchOrdersThunk({ page: 1, limit: 100 }))
    ]).finally(() => {
      isFetchingRef.current = false
    })
  }, [dispatch, userId]) // userId를 의존성에 포함하되, 내부 로직으로 중복 방지

  const latestOrder = useMemo(() => {
    if (!Array.isArray(orders) || orders.length === 0) return null
    return [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0]
  }, [orders])

  const isGuest = !userId

  const handleDeletePet = useCallback(
    async (petId) => {
      if (!petId) return
      try {
        await dispatch(deletePetThunk(petId)).unwrap()
        await dispatch(getUserPetsThunk())
      } catch (error) {
        alert('삭제 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', '오류', 'danger')
      }
    },
    [dispatch]
  )

  return (
    <section className="container py-5">
        <PageHeader
          title="마이페이지"
          titleClassName="mypage-title"
          onBack={() => navigate(-1)}
          className="mb-4"
        />

          <div className="d-flex flex-column flex-lg-row gap-4 align-items-stretch">
            <SectionCard className="flex-grow-1" bodyClassName="overflow-hidden p-4" title="PROFILE">
              <Profile user={user} loading={userLoading} />
            </SectionCard>
            <SectionCard className="flex-grow-1" bodyClassName="overflow-hidden p-4" title="주문현황">
              <OrderState order={latestOrder} />
            </SectionCard>
        </div>

              <MenuBar id={userId} isGuest={isGuest} />

              <PetProfileSlider className="mt-4" pets={pets} onDelete={handleDeletePet} />
      <AlertModal
        open={alertModal.isOpen}
        onClose={alertModal.close}
        title={alertModal.config.title}
        message={alertModal.config.message}
        buttonText={alertModal.config.buttonText}
        variant={alertModal.config.variant}
      />
    </section>
  )
}

export default MyPage
