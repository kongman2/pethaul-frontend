import PropTypes from 'prop-types'
import { Button } from '../'
import './Pagination.scss'

/**
 * 공통 페이지네이션 컴포넌트
 * @param {number} currentPage - 현재 페이지
 * @param {number} totalPages - 전체 페이지 수
 * @param {function} onPageChange - 페이지 변경 핸들러 (page) => void
 * @param {string} className - 추가 클래스명
 */
export default function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <div className={`pethaul-pagination ${className}`}>
      <div className="d-flex justify-content-center align-items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange?.(Math.max(1, currentPage - 1))}
        >
          이전
        </Button>
        <span className="fw-semibold">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange?.(Math.min(totalPages, currentPage + 1))}
        >
          다음
        </Button>
      </div>
    </div>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string,
}

