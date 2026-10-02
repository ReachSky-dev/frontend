export type Column<T> = {
  key: string
  label: string
  render: (row: T) => React.ReactNode
  /** klasa CSS dla komórki danych */
  className?: string
  /** klasa CSS dla nagłówka kolumny — domyślnie className */
  headerClassName?: string
}

type TableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  getKey: (row: T) => string
  onRowClick?: (row: T) => void
}

// ZMIANA 4: nagłówki text-sm text-ink-2, cały wiersz oddzielony border-line
export function Table<T>({ columns, rows, getKey, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-line">
            {columns.map(col => (
              <th
                key={col.key}
                className={`pb-3 pr-4 text-sm font-medium text-ink-2 ${col.headerClassName ?? col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr
              key={getKey(row)}
              onClick={() => onRowClick?.(row)}
              className={[
                'border-b border-line last:border-0',
                onRowClick ? 'cursor-pointer hover:bg-layer' : '',
              ].join(' ')}
            >
              {columns.map(col => (
                <td key={col.key} className={`py-3 pr-4 text-sm text-ink-1 ${col.className ?? ''}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
