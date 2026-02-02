import { HTMLAttributes, ReactNode, forwardRef } from 'react'

export type CoefficientTableRow = Record<string, ReactNode>

export interface CoefficientTableProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Optional table title
   */
  tableTitle?: ReactNode

  /**
   * Table header labels
   */
  theadHeaders: ReactNode[]

  /**
   * Keys to map row data to columns
   */
  theadHeaderKeys: string[]

  /**
   * Table data
   */
  data: CoefficientTableRow[]
}

/**
 * CoefficientTable component
 * Mirrors the legacy mining coefficient table style
 */
export const CoefficientTable = forwardRef<HTMLDivElement, CoefficientTableProps>(
  ({ tableTitle, theadHeaders, theadHeaderKeys, data, className = '', ...props }, ref) => {
    const columnCount = Math.max(theadHeaders.length, theadHeaderKeys.length, 1)
    const gridTemplateColumns = `repeat(${columnCount}, 1fr)`

    return (
      <div
        ref={ref}
        className={`coefficient-table ${className}`}
        {...props}
      >
        {tableTitle ? <div className="table-title text-[14px]">{tableTitle}</div> : null}

        <div
          className="table-header"
          style={{ gridTemplateColumns }}
        >
          {theadHeaders.map((header, index) => (
            <span key={`header-${index}`} className="table-header-item text-[12px]">
              {header}
            </span>
          ))}
        </div>

        {data.map((row, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="table-row"
            style={{ gridTemplateColumns }}
          >
            {theadHeaderKeys.map((key, colIndex) => (
              <span key={`cell-${rowIndex}-${colIndex}`} className="text-[13px]">
                {row[key]}
              </span>
            ))}
          </div>
        ))}

        <style jsx>{`
          .coefficient-table {
            border-radius: 6px;
            overflow: hidden;
            background: rgba(16, 16, 45, 0.6);
            font-weight: 400;
          }

          .table-title {
            font-weight: 500;
            text-align: center;
            padding: 10px;
            color: #fff;
            background: rgba(255, 255, 255, 0.05);
          }

          .table-header,
          .table-row {
            display: grid;
            text-align: center;
            padding: 4px 0;
          }

          .table-header {
            background: rgba(255, 255, 255, 0.1);
          }

          .table-header span {
            color: #fff;
            font-weight: 400;
          }

          .table-row {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .table-row:last-child {
            border-bottom: none;
          }

          .table-row span {
            color: rgba(255, 255, 255, 0.8);
          }
        `}</style>
      </div>
    )
  },
)

CoefficientTable.displayName = 'CoefficientTable'
