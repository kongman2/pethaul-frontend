import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import ItemPanel from '../../components/admin/ItemPanel'
import OrderPanel from '../../components/admin/OrderPanel'
import ChartPanel from '../../components/admin/ChartPanel'
import ContentPanel from '../../components/admin/ContentPanel'
import QnAPanel from '../../components/admin/QnAPanel'
import { Button, PageHeader } from '../../components/common'
import useAppBackground from '../../hooks/useAppBackground'
import './AdminPage.scss'

function AdminPage() {
  useAppBackground('app-bg--gradient')
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(0)

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
      </div>

      <div className="tab-content">{renderPanel()}</div>
    </section>
  )
}

export default AdminPage
