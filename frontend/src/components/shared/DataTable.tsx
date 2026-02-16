import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = "No data available",
  className,
}: DataTableProps<T>) {
  function handleSort(key: string, sortable?: boolean) {
    if (sortable && onSort) {
      onSort(key);
    }
  }

  function getCellValue(item: T, column: Column<T>): ReactNode {
    if (column.render) {
      return column.render(item);
    }
    return String((item as any)[column.key] ?? "");
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-secondary-200 bg-white p-12 text-center">
        <p className="text-secondary-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-secondary-200 bg-white shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-secondary-200">
          <thead className="bg-secondary-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-xs font-medium uppercase tracking-wider text-secondary-700",
                    column.align === "right" && "text-right",
                    column.align === "center" && "text-center",
                    column.sortable &&
                      "cursor-pointer select-none hover:bg-secondary-100",
                    column.width && `w-${column.width}`,
                  )}
                  onClick={() => handleSort(column.key, column.sortable)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      column.align === "right" && "justify-end",
                      column.align === "center" && "justify-center",
                    )}
                  >
                    <span>{column.header}</span>
                    {column.sortable && sortBy === column.key && (
                      <span className="text-primary-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 bg-white">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={cn(
                  "transition-colors",
                  index % 2 === 0 ? "bg-white" : "bg-secondary-50",
                  onRowClick && "cursor-pointer hover:bg-secondary-100",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "whitespace-nowrap px-6 py-4 text-sm text-secondary-900",
                      column.align === "right" && "text-right",
                      column.align === "center" && "text-center",
                    )}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
