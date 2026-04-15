"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

export type ColumnDef<T> = {
  label: string;
  sortKey?: string;         // makes the header clickable for sort
  headerClassName?: string; // extra classes on <th>
  className?: string;       // extra classes on <td>
  render: (row: T) => React.ReactNode;
};

type Props<T> = {
  columns: ColumnDef<T>[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
};

export default function AdminTable<T>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = "No data found.",
  sortKey,
  sortDir = "asc",
  onSort,
  onRowClick,
  rowClassName,
}: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-white">
        <thead>
          <tr className="border-b border-white/10 text-white/40 text-left">
            {columns.map((col, i) => {
              const sortable = !!col.sortKey && !!onSort;
              const active   = col.sortKey === sortKey;
              const Icon     = active && sortDir === "desc" ? ArrowDown : ArrowUp;
              return (
                <th
                  key={i}
                  onClick={() => sortable && onSort!(col.sortKey!)}
                  className={`px-4 py-3 font-medium ${sortable ? "cursor-pointer select-none" : ""} ${col.headerClassName ?? ""}`}
                >
                  {sortable ? (
                    <span className="flex items-center gap-1">
                      {col.label}
                      <Icon size={12} className={active ? "text-white" : "text-white/20"} />
                    </span>
                  ) : (
                    col.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-white/40">
                {emptyMessage}
              </td>
            </tr>
          ) : rows.map((row) => (
            <tr
              key={keyExtractor(row)}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-white/5 hover:bg-white/3 transition-colors ${onRowClick ? "cursor-pointer" : ""} ${rowClassName?.(row) ?? ""}`}
            >
              {columns.map((col, i) => (
                <td key={i} className={`px-4 py-3 ${col.className ?? ""}`}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
