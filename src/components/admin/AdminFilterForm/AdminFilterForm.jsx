import { Button } from '../../common'
/**
 * Reusable Admin Filter Form
 * - statusOptions: [{value,label}]
 * - tagOptions: [{value,label}] | null
 * - values: { q, status, tag }
 * - onChange: { setQ, setStatus, setTag }
 * - onSearch: (e) => void
 * - rightSlot: ReactNode (e.g., "새 콘텐츠 등록" 버튼)
 */
export default function AdminFilterForm({
  title,
  statusOptions = [],
  tagOptions = null,
  values: { q = '', status = 'all', tag = '' } = {},
  onChange: { setQ, setStatus, setTag } = {},
  onSearch,
  onReset,
  rightSlot,
}) {
  return (
    <div className="mb-4">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        {title && <h2 className="h5 mb-0">{title}</h2>}
        {rightSlot}
      </div>

      <form className="card card-body bg-light p-3" onSubmit={onSearch}>
        <div className="row g-3 align-items-end">
          {statusOptions?.length > 0 && (
            <div className="col-12 col-md-auto">
              <label className="form-label small fw-semibold">상태</label>
              <select
                className="form-select form-select-sm"
                value={status}
                onChange={(e) => setStatus?.(e.target.value)}
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {Array.isArray(tagOptions) && (
            <div className="col-12 col-md-auto">
              <label className="form-label small fw-semibold">태그</label>
              <select
                className="form-select form-select-sm"
                value={tag}
                onChange={(e) => setTag?.(e.target.value)}
              >
                {tagOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="col-12 col-md">
            <label className="form-label small fw-semibold">검색</label>
            <input
              className="form-control form-control-sm"
              placeholder="검색어"
              value={q}
              onChange={(e) => setQ?.(e.target.value)}
            />
          </div>

          <div className="col-12 col-md-auto d-flex flex-wrap justify-content-md-end gap-2">
            <button className="btn btn-primary" type="submit">검색</button>
            {onReset && (
              <button className="btn btn-outline-secondary" type="button" onClick={onReset}>초기화</button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

