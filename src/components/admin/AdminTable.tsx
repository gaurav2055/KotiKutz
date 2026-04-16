"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

export type ColumnDef<T> = {
  label: string;
  sortKey?: string;         // makes the header clickable for sort
  headerClassName?: string; // extra classes on <th>
  className?: string;       // extra classes on <td>
  mobileHero?: boolean;     // rendered at top of mobile card (not as label:value)
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
  /** "cards" (default) stacks rows as cards on mobile. "scroll" keeps the table with horizontal scroll on all screen sizes. */
  mobileView?: "cards" | "scroll";
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
  mobileView = "cards",
}: Props<T>) {
  const heroColumns  = columns.filter((col) => col.mobileHero);
  const cardColumns  = columns.filter((col) => col.label && !col.mobileHero);

  const tableEl = (
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
  );

  if (mobileView === "scroll") {
    return (
      <div className="overflow-x-auto rounded-xl border border-white/10">
        {tableEl}
      </div>
    );
  }

  return (
    <>
      {/* Mobile card list */}
      <div className="sm:hidden rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-4 py-10 text-center text-white/40 text-sm">{emptyMessage}</div>
        ) : rows.map((row) => (
          <div
            key={keyExtractor(row)}
            onClick={() => onRowClick?.(row)}
            className={`p-4 space-y-2.5 ${onRowClick ? "cursor-pointer active:bg-white/5" : ""} ${rowClassName?.(row) ?? ""}`}
          >
            {/* Hero content (avatar/image) at top of card */}
            {heroColumns.length > 0 && (
              <div className="flex items-center gap-3">
                {heroColumns.map((col, i) => <div key={i}>{col.render(row)}</div>)}
              </div>
            )}
            {/* Label : value rows */}
            {cardColumns.map((col, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <span className="text-white/40 text-xs mt-0.5 shrink-0">{col.label}</span>
                <div className="text-sm text-right">{col.render(row)}</div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10">
        {tableEl}
      </div>
    </>
  );
}
