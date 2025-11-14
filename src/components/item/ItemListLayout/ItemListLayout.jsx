import PropTypes from 'prop-types'
import { SectionCard } from '../../common'

function ItemListLayout({
  title,
  filterOpen,
  onToggleFilter,
  filterForm,
  activeFilterChips,
  countLabel,
  sortControl,
  hasItems,
  emptyContent,
  children,
  pagination,
}) {
  return (
    <section className="container py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <SectionCard
            variant="item"
            title={title}
            headerActions={
              <button
                type="button"
                className="filter-form__toggle btn btn-link p-0 text-white"
                onClick={onToggleFilter}
                aria-expanded={filterOpen}
                aria-label="필터 토글"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 8.5h11m-18 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0m0 7h11m3 0a2 2 0 1 0 4 0a2 2 0 0 0-4 0"
                  />
                </svg>
              </button>
            }
          >
            {filterOpen && filterForm}
          </SectionCard>
        </div>
      </div>

      {activeFilterChips}

      <div className="row justify-content-center mt-4">
        <div className="col-12 col-xl-10">
          <div className="row align-items-center gx-3 gy-2 mb-3">
            <div className="col-auto">
              <p className="item-count mb-0">{countLabel}</p>
            </div>
            {sortControl && <div className="col-auto ms-auto">{sortControl}</div>}
          </div>

          {hasItems ? children : emptyContent}

          {pagination}
        </div>
      </div>
    </section>
  )
}

ItemListLayout.propTypes = {
  title: PropTypes.string,
  filterOpen: PropTypes.bool.isRequired,
  onToggleFilter: PropTypes.func.isRequired,
  filterForm: PropTypes.node,
  activeFilterChips: PropTypes.node,
  countLabel: PropTypes.string.isRequired,
  sortControl: PropTypes.node,
  hasItems: PropTypes.bool.isRequired,
  emptyContent: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  pagination: PropTypes.node,
}

export default ItemListLayout
