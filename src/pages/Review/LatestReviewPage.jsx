// 하위 호환성을 위해 ReviewListPage로 리다이렉트
import { Navigate } from 'react-router-dom'

export default function LatestReviewPage() {
  return <Navigate to="/reviews?type=all" replace />
}
