import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import ItemPanel from '../../components/admin/ItemPanel'
import OrderPanel from '../../components/admin/OrderPanel'
import ChartPanel from '../../components/admin/ChartPanel'
import ContentPanel from '../../components/admin/ContentPanel'
import QnAPanel from '../../components/admin/QnAPanel'
import UserPanel from '../../components/admin/UserPanel'
import { Button, PageHeader } from '../../components/common'
import useAppBackground from '../../hooks/useAppBackground'
import './AdminPage.scss'

function AdminPage() {
  useAppBackground('app-bg--gradient')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(location.state?.activeTab ?? 0)

  // location.state에서 activeTab이 전달되면 탭 변경
  useEffect(() => {
    if (location.state?.activeTab != null) {
      setActiveTab(location.state.activeTab)
      // state 초기화
      navigate(location.pathname, { replace: true })
    }
  }, [location.state?.activeTab, navigate, location.pathname])

  const renderPanel = () => {
    switch (activeTab) {
      case 0:
        return <OrderPanel />
      case 1:
        return <ItemPanel />
      case 2:
        return <ChartPanel />
      case 3:
        return <ContentPanel />
      case 4:
        return <QnAPanel />
      case 5:
        return <UserPanel />
      default:
        return null
    }
  }

  return (
    <section className="container py-4">
      <PageHeader title="ADMIN SECTION" onBack={() => navigate(-1)} className="mb-4" titleClassName="text-center" />

      <div className="d-flex flex-wrap gap-2 mb-4">
        <Button variant={activeTab === 0 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(0)}>
          주문 관리
        </Button>
        <Button variant={activeTab === 1 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(1)}>
          상품 관리
        </Button>
        <Button variant={activeTab === 2 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(2)}>
          매출 차트
        </Button>
        <Button variant={activeTab === 3 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(3)}>
          컨텐츠 등록
        </Button>
        <Button variant={activeTab === 4 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(4)}>
          1:1 문의
        </Button>
        <Button variant={activeTab === 5 ? 'primary' : 'outline'} className="flex-grow-1" onClick={() => setActiveTab(5)}>
          회원 관리
        </Button>
      </div>

      <div className="tab-content">{renderPanel()}</div>
    </section>
  )
}

export default AdminPage
