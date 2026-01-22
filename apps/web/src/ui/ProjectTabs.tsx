import { HTMLAttributes, ReactNode, forwardRef } from 'react'

export interface ProjectTabItem {
  label: ReactNode
  iconSrc?: string
  disabled?: boolean
  key?: string | number
}

export interface ProjectTabsProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tab items
   */
  tabs: ProjectTabItem[]

  /**
   * Active tab index
   */
  activeIndex?: number

  /**
   * Change handler
   */
  onChange?: (index: number, tab: ProjectTabItem) => void

  /**
   * Add horizontal padding (mirrors home layout)
   */
  padded?: boolean
}

/**
 * ProjectTabs component
 * Mirrors the legacy ProjectTabs style
 */
export const ProjectTabs = forwardRef<HTMLDivElement, ProjectTabsProps>(
  (
    { tabs, activeIndex = 0, onChange, padded = false, className = '', ...props },
    ref,
  ) => {
    const rootClassName = [
      'project-tabs',
      padded ? 'padded' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div ref={ref} className={rootClassName} role="tablist" {...props}>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex
          const isDisabled = Boolean(tab.disabled)
          const key = tab.key ?? index
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled || undefined}
              className={`tab-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
              onClick={() => {
                if (isDisabled) return
                onChange?.(index, tab)
              }}
              disabled={isDisabled}
            >
              {tab.iconSrc ? (
                <img className="tab-icon" src={tab.iconSrc} alt="" aria-hidden="true" />
              ) : null}
              <span className="tab-text">{tab.label}</span>
            </button>
          )
        })}

        <style jsx>{`
          .project-tabs {
            font-family: var(--font-primary);
            display: flex;
            align-items: center;
            gap: 9px;
            margin-bottom: 10px;
          }

          .project-tabs.padded {
            padding: 0 15px;
          }

          .tab-item {
            flex: 1;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            height: 30px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 700;
            color: #ffffff;
            cursor: pointer;
            transition: background-color 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background-color: var(--color-secondary-bg);
            backdrop-filter: blur(10px);
            padding: 0;
            outline: none;
            box-sizing: border-box;
            -webkit-appearance: none;
            appearance: none;
          }

          .tab-item.active {
            background-color: var(--color-primary);
            border-color: transparent;
          }

          .tab-item.disabled {
            cursor: not-allowed;
            opacity: 0.6;
          }

          .tab-icon {
            width: 18px;
            height: 18px;
            margin-right: 6px;
            filter: brightness(0) invert(1);
          }
        `}</style>
      </div>
    )
  },
)

ProjectTabs.displayName = 'ProjectTabs'
