import './OrderState.scss'
import React, { useMemo } from 'react'
import { getPlaceholderImage, buildImageUrl } from '../../../utils/imageUtils'

function OrderState({ order }) {
  const summary = useMemo(() => {
    if (!order) return null

    const items = Array.isArray(order.Items) ? order.Items : []
    if (items.length === 0) return null

    const firstItem = items[0]

    // 통일된 이미지 처리: buildImageUrl 사용
    const imgUrl = firstItem?.ItemImages?.[0]?.imgUrl
    const resolvedImg = imgUrl ? buildImageUrl(imgUrl) : getPlaceholderImage()

    return {
      itemName: firstItem?.itemNm ?? '상품 정보 없음',
      price: firstItem?.price != null ? `${firstItem.price.toLocaleString()}원` : '가격 정보 없음',
      orderDate: order?.orderDate ? order.orderDate.slice(0, 10) : '주문일자 정보 없음',
      orderStatus: order?.orderStatus ?? null,
      imgUrl: resolvedImg,
    }
  }, [order])

  if (!summary) {
    return <p className="order-state__empty text-center text-muted mb-0">최근 주문이 없습니다.</p>
  }

  const { itemName, price, orderDate, orderStatus, imgUrl } = summary

  const steps = [
    {
      key: 'ORDER',
      label: '판매자확인',
      description: '확인완료\n곧 준비해드릴게요!',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            fill="#000"
            d="M29.715 12.955h1.52v6.09h-1.52Zm-19.81 0h1.52v-1.53h1.53v-1.52h6.09v1.52h1.53v-1.52h4.57v1.52h1.52v12.19h1.53v-3.04h1.52v-1.53h-1.52v-6.09h1.52v-1.53h-1.52v-6.09h-1.53v1.52h-1.52v-1.52h-3.05v-1.53h-10.67v1.53h-1.52v1.52h-1.52v3.05h-1.53v-4.57h-1.52v4.57h-1.52v1.52h6.09z"
            strokeWidth={1}
            stroke="#000"
          ></path>
          <path
            fill="#000"
            d="M25.145 23.615h1.52v1.53h-1.52Zm0-19.81h1.52v1.53h-1.52Zm-1.53 16.77h1.53v1.52h-1.53Zm0-4.58h1.53v3.05h-1.53Zm0-13.71h1.53v1.52h-1.53Zm-12.19 22.86V28.2h-3.04v1.52h-3.05v1.52h24.38v-1.52h-3.05V28.2h-3.05v-1.53h1.53v-1.52Zm10.67 4.57h-6.09V28.2h-3.05v-1.53H22.1Zm-3.05-7.62h4.57v1.52h-4.57Zm0-3.05h1.53v1.53h-1.53Zm0-6.09h1.53v1.52h-1.53Zm-1.52 4.57h1.52v1.52h-1.52Zm0-3.05h1.52v1.53h-1.52Zm-1.53 1.53h1.53v1.52h-1.53ZM3.05 1.52h15.24v1.53H3.05ZM1.52 28.95h1.53v1.53H1.52Zm0-25.9h1.53v1.52H1.52ZM0 4.57h1.52v24.38H0Z"
            strokeWidth={1}
            stroke="#000"
          ></path>
        </svg>
      ),
    },
    {
      key: 'READY',
      label: '상품준비중',
      action: '운송장조회하기',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            fill="#000"
            d="M28.95 8.385h1.53v1.52h-1.53Zm-1.52 1.52h1.52v1.52h-1.52Zm-1.53 9.14v1.53h3.05v-3.05h-1.52v1.52zm0-3.05h1.53v1.53H25.9Zm0-4.57h1.53v1.53H25.9Zm0-4.57h3.05v1.53H25.9Zm-3.04 13.72h3.04v1.52h-3.04Zm0-6.1h1.52v1.52h1.52v-3.04h-3.04zm0-9.14h3.04v1.52h-3.04Zm-1.53 6.09h1.53v1.53h-1.53Zm-1.52-7.62h3.05v1.53h-3.05Zm0 16.77h-1.52v-1.53h-1.53v-1.52h-3.05v1.52h1.53v7.62h-1.53v1.53h3.05v-1.53h3.05v-1.52h3.05v-3.05h-3.05zm0-6.1h3.05v1.52h-3.05Zm-1.52-4.57h3.04v1.52h-3.04Zm0-4.57h1.52v1.52h-1.52Zm-1.53 10.66h3.05v1.53h-3.05Zm1.53-6.09v-3.05h-1.53v1.53h-1.52v-1.53h-1.53v3.05z"
            strokeWidth={1}
            stroke="#000"
          ></path>
          <path
            fill="#000"
            d="M10.67 25.145h3.04v1.52h-3.04Zm1.52-6.1h1.52v1.53h-1.52Zm-1.52-3.05h3.04v1.53h-3.04Zm0-6.09h3.04v1.52h-3.04Zm1.52-4.57h1.52v1.52h-1.52Zm-1.52 15.24h1.52v1.52h-1.52ZM9.14 3.805h3.05v1.53H9.14Zm-1.52 18.29h3.05v3.05H7.62Zm0-7.62h3.05v1.52H7.62Zm0-3.05h3.05v1.53H7.62ZM6.1 5.335h3.04v1.52H6.1Zm-1.53 15.24h3.05v1.52H4.57Zm1.53-7.62h1.52v1.52H6.1Zm-1.53 1.52H6.1v1.52H4.57Zm0-3.05H6.1v1.53H4.57Zm-1.52-4.57H6.1v1.53H3.05Zm1.52 12.19H3.05v-1.52H1.52v3.05h3.05zm-1.52-3.05h1.52v1.53H3.05Zm0-6.09h1.52v1.52H3.05Zm-1.53-1.52h1.53v1.52H1.52Z"
            strokeWidth={1}
            stroke="#000"
          ></path>
        </svg>
      ),
    },
    {
      key: 'SHIPPED',
      label: '배송중',
      action: '배송상세확인',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            fill="#000"
            d="M30.48 16.765v-1.53h-1.53v-1.52h-1.52v-1.53h-1.52v3.05h-1.53v1.53h-1.52v-4.58h3.05v-1.52h-7.62v-1.52h-1.53v10.66H1.53v-4.57H0v10.67h1.53v-4.57h15.23v4.57h-6.09v-1.53H9.14v4.58h1.53v-1.53h9.14v1.53h1.53v-4.58h-1.53v1.53h-1.52v-13.72h3.05v6.1h1.52v1.52h7.62v6.1H32v-9.14z"
            strokeWidth={1}
            stroke="#000"
          ></path>
          <path
            fill="#000"
            d="M27.43 24.375h-1.52v4.58h1.52v-1.53h3.05v-1.52h-3.05zm-6.09 4.58h4.57v1.52h-4.57Zm1.52-3.05h1.52v1.52h-1.52Zm-1.52-3.05h4.57v1.52h-4.57Zm-7.62-16.76v6.09h-1.53v1.53h3.05v-9.14h-3.05v1.52zm-4.58 0h3.05v1.52H9.14Zm0 10.67v-1.53h3.05v-1.52H9.14v-6.1H6.1v1.53h1.52v6.09H6.1v1.53zm0-13.72h3.05v1.53H9.14Zm-4.57 19.81h4.57v1.52H4.57ZM6.1 1.525h3.04v1.52H6.1Zm-1.53 27.43h4.57v1.52H4.57Zm1.53-3.05h1.52v1.52H6.1Zm-3.05-12.19H6.1v1.52H3.05Zm0-10.67H6.1v1.53H3.05Zm1.52 21.33H3.05v1.53H1.53v1.52h1.52v1.53h1.52zM3.05 6.095H6.1v1.52H3.05Zm-1.52 6.09v-6.09h1.52v-1.52H0v9.14h3.05v-1.53z"
            strokeWidth={1}
            stroke="#000"
          ></path>
        </svg>
      ),
    },
    {
      key: 'DELIVERED',
      label: '배송완료',
      description: '배송완료\n되었습니다!',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 32 32" aria-hidden>
          <path
            fill="#000"
            d="M7.62 29.715h12.19v1.52H7.62Zm12.19-1.52h4.57v1.52h-4.57Zm-4.57-1.53v-1.52H4.57v1.52h1.52v3.05h1.53v-3.05zm-9.15-4.57v-1.52H1.52v1.52h1.52v3.05h1.53v-3.05zm6.1-1.52v-1.53h3.05v-1.52h-3.05v-7.62H9.14v1.52h1.52v7.62H9.14v1.53zm-6.1-3.05h3.05v1.52H6.09Zm-6.09 0h1.52v3.05H0Zm15.24-1.52h3.04v1.52h-3.04Zm-12.2 0h3.05v1.52H3.04Zm0-7.62h3.05v-1.53H3.04v-1.52H1.52v10.67h1.52zM27.43 9.9v1.52H25.9v1.53h1.53v13.71h-3.05v1.54h3.05v1.52H32V9.9Zm3.04 16.76h-1.52v-3.05h1.52Z"
            strokeWidth={1}
            stroke="#000"
          ></path>
          <path
            fill="#000"
            d="M24.38 9.905h1.52v1.52h-1.52Zm-3.05-1.52h3.05v1.52h-3.05Zm-9.14 0h3.05v1.52h-3.05Zm-4.57-1.53v1.53H6.09v1.52h3.05v-3.05zm7.62 0v1.53h3.04v7.62h1.53V5.335h-1.53v1.52zm-6.1-1.52h3.05v1.52H9.14Zm6.1-1.52h3.04v1.52h-3.04Zm-1.53 1.52v-1.52h1.53v-1.53h-3.05v3.05zM3.04 3.815h3.05v1.52H3.04Zm3.05-1.53h3.05v1.53H6.09ZM9.14.765h3.05v1.52H9.14Z"
            strokeWidth={1}
            stroke="#000"
          ></path>
        </svg>
      ),
    },
  ]

  return (
    <div className="d-flex flex-column gap-2">
      <div className="d-flex gap-3 align-items-center justify-content-center">
        <div>
          <img src={imgUrl || getPlaceholderImage()} alt="주문 상품 이미지" className="order-state__thumb" />
        </div>
        <div>
          <dl className="order-state__details">
            <div>
              <dt>상품명</dt>
              <dd>{itemName}</dd>
            </div>
            <div>
              <dt>가격</dt>
              <dd>{price}</dd>
            </div>
            <div>
              <dt>주문일자</dt>
              <dd>{orderDate}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="order-state__steps row row-cols-2 row-cols-lg-4 g-3">
        {steps.map((step) => {
          const isActive = orderStatus === step.key
          return (
            <div className="col" key={step.key}>
              <div className={`order-state__step ${isActive ? 'is-active' : ''}`}>
                <div className="order-state__icon">{step.icon}</div>
                <p className="order-state__step-title">{step.label}</p>
                {step.description && <p className="order-state__step-text">{step.description}</p>}
                {step.action && <span className="order-state__step-link">{step.action}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderState