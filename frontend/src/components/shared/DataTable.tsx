import { ReactNode } from "react";
import * as React from "react";
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

  function handleRowKeyDown(e: React.KeyboardEvent, item: T) {
    if (onRowClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onRowClick(item);
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
      <div
        className="rounded-lg border border-secondary-200 bg-white p-12 text-center"
        role="status"
        aria-live="polite"
      >
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
        <table
          className="min-w-full divide-y divide-secondary-200"
          role="table"
          aria-label="Data table"
        >
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
                  onKeyDown={(e) => {
                    if (
                      column.sortable &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      handleSort(column.key, column.sortable);
                    }
                  }}
                  tabIndex={column.sortable ? 0 : undefined}
                  role={column.sortable ? "button" : undefined}
                  aria-sort={
                    column.sortable && sortBy === column.key
                      ? sortOrder === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  aria-label={
                    column.sortable
                      ? `${column.header}, sortable column${sortBy === column.key ? `, currently sorted ${sortOrder === "asc" ? "ascending" : "descending"}` : ""}`
                      : column.header
                  }
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
                      <span className="text-primary-600" aria-hidden="true">
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
                  onRowClick &&
                    "cursor-pointer hover:bg-secondary-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500",
                )}
                onClick={() => onRowClick?.(item)}
                onKeyDown={(e) => handleRowKeyDown(e, item)}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "button" : undefined}
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
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {data.length} {data.length === 1 ? "row" : "rows"}
      </div>
    </div>
  );
}
