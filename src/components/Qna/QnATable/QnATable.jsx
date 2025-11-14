import PropTypes from 'prop-types'
import './QnATable.scss'

/**
 * 공통 QnA 테이블 컴포넌트
 * - qnaList: QnA 목록 배열
 * - renderHeader: 헤더 커스터마이징 (선택)
 * - renderRow: 각 행 렌더링 함수
 * - renderBody: body 내용 렌더링 함수
 */
export default function QnATable({ qnaList, renderHeader, renderRow, renderBody, className = '' }) {
  const defaultHeader = (
    <div className="qna-table-header">
      <span className="col-id">번호</span>
      <span className="col-title">제목</span>
      <span className="col-author">작성자</span>
      <span className="col-date">작성일</span>
      <span className="col-status">상태</span>
    </div>
  )

  return (
    <div className={`qna-table ${className}`}>
      {renderHeader ? renderHeader() : defaultHeader}

      {qnaList.length === 0 ? (
        <div className="alert alert-secondary bg-transparent border-0 mb-0" role="status">
          등록된 문의가 없습니다.
        </div>
      ) : (
        qnaList.map((q) => (
          <details className="qna-item" key={q.id}>
            <summary className="qna-summary">
              {renderRow ? (
                renderRow(q)
              ) : (
                <>
                  <span className="col-id">{q.id}</span>
                  <span className="col-title">{q.title}</span>
                  <span className="col-author">{q?.User?.name || '익명'}</span>
                  <span className="col-date">{(q?.createdAt || '').slice(0, 10)}</span>
                  <span className="col-status">{q?.comment ? '답변 완료' : '확인 중'}</span>
                </>
              )}
            </summary>

            {renderBody && <div className="qna-body">{renderBody(q)}</div>}
          </details>
        ))
      )}
    </div>
  )
}

QnATable.propTypes = {
  qnaList: PropTypes.array.isRequired,
  renderHeader: PropTypes.func,
  renderRow: PropTypes.func,
  renderBody: PropTypes.func,
  className: PropTypes.string,
}

