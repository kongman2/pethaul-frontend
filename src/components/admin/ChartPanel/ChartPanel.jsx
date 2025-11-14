import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllOrdersThunk } from '../../../features/orderSlice'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

import './ChartPanel.scss'
import { Button, SectionCard, Spinner, Tabs } from '../../common'
import AdminPanelLayout from '../AdminPanelLayout/AdminPanelLayout'

function ChartPanel() {
  const dispatch = useDispatch()
  const { orders, loading, error } = useSelector((state) => state.order)
  const [sort, setSort] = useState('salesCount')

  useEffect(() => {
    dispatch(fetchAllOrdersThunk(sort))
  }, [dispatch, sort])

  // 주문일자 shortDate로 변환 (차트용)
  const groupedOrders = Object.values(
    orders.reduce((acc, cur) => {
      const dateKey = cur.orderDate.slice(0, 10)
      if (!acc[dateKey]) {
        acc[dateKey] = { shortDate: dateKey, orderPrice: 0, orderCount: 0 }
      }
      acc[dateKey].orderPrice += cur.orderPrice || 0
      acc[dateKey].orderCount += cur.count || 0
      return acc
    }, {})
  )

  // 차트 라벨
  const labelMap = {
    count: '판매량',
    orderCount: '주문 건수',
    orderPrice: '매출액',
  }
  const legendFormatter = (value) => labelMap[value] || value

  if (loading) return <Spinner text="차트 데이터를 불러오는 중..." />
  if (error) return <p>에러 발생: {error}</p>

  const tabs = [
    {
      id: 'salesCount',
      label: '전체 판매 데이터',
    },
    {
      id: 'orderDate',
      label: '최근 1개월 판매 추이',
    },
    {
      id: 'yesterday',
      label: '전일자 판매 추이',
    },
  ]

  return (
    <AdminPanelLayout title="매출 차트">
      <Tabs tabs={tabs} activeTab={sort} onTabChange={setSort} />

      <div className="row g-4 flex-grow-1">
        <div className="col-12 col-lg-6 col-xl-4 d-flex">
          <SectionCard
            title="상품 판매량"
            className="h-100 w-100 section-card--surface"
            showWindowBtn={false}
            bodyClassName="p-3"
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemNm" />
                  <YAxis />
                  <Tooltip />
                  <Legend formatter={legendFormatter} />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="col-12 col-lg-6 col-xl-4 d-flex">
          <SectionCard
            title="주문 건수"
            className="h-100 w-100 section-card--surface"
            showWindowBtn={false}
            bodyClassName="p-3"
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="itemNm" />
                  <YAxis />
                  <Tooltip />
                  <Legend formatter={legendFormatter} />
                  <Bar dataKey="orderCount" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        <div className="col-12 col-xl-4 d-flex">
          <SectionCard
            title="일자별 매출액"
            className="h-100 w-100 section-card--surface"
            showWindowBtn={false}
            bodyClassName="p-3"
          >
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupedOrders}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shortDate" />
                  <YAxis />
                  <Tooltip />
                  <Legend formatter={legendFormatter} />
                  <Bar dataKey="orderPrice" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>
    </AdminPanelLayout>
  )
}

export default ChartPanel

