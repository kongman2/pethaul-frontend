import { memo } from 'react'
import './Tabs.scss'

/**
 * Tabs 컴포넌트
 * @param {Array} tabs - 탭 배열 [{ id, label, badge, badgeVariant }]
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {Function} onTabChange - 탭 변경 핸들러 (tabId) => void
 * @param {string} className - 추가 클래스명
 */
function Tabs({ tabs = [], activeTab, onTabChange, className = '' }) {
  if (!Array.isArray(tabs) || tabs.length === 0) {
    return null
  }

  return (
    <div className={`pethaul-tabs ${className}`}>
      <ul className="pethaul-tabs__list" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <li key={tab.id} className="pethaul-tabs__item" role="presentation">
              <button
                type="button"
                className={`pethaul-tabs__button ${isActive ? 'is-active' : ''}`}
                onClick={() => onTabChange?.(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
              >
                <span className="pethaul-tabs__label">{tab.label}</span>
                {tab.badge != null && (
                  <span className={`pethaul-tabs__badge badge bg-${tab.badgeVariant || 'secondary'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default memo(Tabs)

