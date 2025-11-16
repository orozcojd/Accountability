/**
 * Data Table Component
 * Used for: Voting records, donor lists, stock trades
 * Features: Responsive, sortable, accessible
 */

import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption?: string;
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  caption,
  className,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-medium-gray text-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto scrollbar-thin', className)}>
      <table className="w-full border-collapse border border-light-gray">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}

        <thead className="bg-off-white">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-body-small font-semibold text-dark-gray',
                  'border-b border-light-gray',
                  column.className
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={cn(
                'border-b border-light-gray',
                'hover:bg-off-white transition-colors duration-150',
                rowIndex % 2 === 0 ? 'bg-white' : 'bg-background'
              )}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-body',
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key as keyof T]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Simple data list for mobile views
 */
interface DataListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function DataList<T>({ data, renderItem, className }: DataListProps<T>) {
  return (
    <div className={cn('space-y-4', className)}>
      {data.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
