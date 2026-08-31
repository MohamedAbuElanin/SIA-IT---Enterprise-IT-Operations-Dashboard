import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight, Columns3, X } from 'lucide-react';
import { Button } from '../ui/Button';

interface DataGridProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  exportFileName?: string;
  filters?: Array<{ columnId: string; label: string; getValue: (row: TData) => string }>;
}

export function DataGrid<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'البحث في السجلات...',
  onRowClick,
  exportFileName = 'export-data',
  filters = [],
}: DataGridProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState(false);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
      columnFilters,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportToCSV = () => {
    if (!data.length) return;
    const headers = columns.map((col) => (typeof col.header === 'string' ? col.header : col.id || 'field')).join(',');
    const rows = data.map((row) =>
      Object.values(row as Record<string, unknown>)
        .map((val) => `"${String(val).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${exportFileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pr-9 pl-4 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsColumnMenuOpen((open) => !open)}
              icon={<Columns3 className="w-4 h-4" />}
            >
              الأعمدة (Columns)
            </Button>
            {isColumnMenuOpen && (
              <div className="absolute left-0 z-20 mt-2 w-56 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl text-right">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800 pb-2 mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">الأعمدة المرئية</span>
                  <button
                    type="button"
                    onClick={() => setIsColumnMenuOpen(false)}
                    className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
                    aria-label="إغلاق قائمة الأعمدة"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="max-h-64 space-y-0.5 overflow-y-auto py-1">
                  {table.getAllLeafColumns().map((column) => {
                    const header = column.columnDef.header;
                    const label = typeof header === 'string' ? header : column.id;
                    if (!label) return null;
                    return (
                      <label key={column.id} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
                        <input
                          type="checkbox"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                          className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-950 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => table.resetColumnVisibility()}
                  className="mt-1 w-full rounded-lg px-2 py-1.5 text-right text-xs font-medium text-blue-400 hover:bg-blue-500/10 border-t border-slate-800"
                >
                  إعادة ضبط الأعمدة
                </button>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={exportToCSV} icon={<Download className="w-4 h-4" />}>
            تصدير CSV
          </Button>
        </div>
      </div>

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">فلاتر متقدمة:</span>
          {filters.map((filter) => {
            const options = Array.from(new Set(data.map(filter.getValue))).filter(Boolean).sort();
            const selected = String(table.getColumn(filter.columnId)?.getFilterValue() ?? '');
            return (
              <label key={filter.columnId} className="flex items-center gap-2 text-xs text-slate-400">
                <span>{filter.label}</span>
                <select value={selected} onChange={(event) => table.getColumn(filter.columnId)?.setFilterValue(event.target.value || undefined)} className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500">
                  <option value="">الكل (All)</option>
                  {options.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </label>
            );
          })}
          {columnFilters.length > 0 && <button type="button" onClick={() => setColumnFilters([])} className="text-xs font-medium text-blue-400 hover:text-blue-300">مسح الفلاتر</button>}
        </div>
      )}

      {/* TanStack Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/80 backdrop-blur-md shadow-lg">
        <table className="w-full text-right border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-800 bg-slate-950/60">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider select-none text-right"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={header.column.getCanSort() ? 'flex items-center gap-1.5 cursor-pointer hover:text-slate-200' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && <ArrowUpDown className="w-3 h-3 text-slate-500" />}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={`transition-colors duration-150 ${
                    onRowClick ? 'cursor-pointer hover:bg-slate-800/60' : 'hover:bg-slate-800/30'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length} className="px-4 py-8 text-center text-sm text-slate-500">
                  لم يتم العثور على سجلات مطابقة لفلاتر البحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 px-1">
        <div>
          عرض {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} إلى{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          من إجمالي {table.getFilteredRowModel().rows.length} سجل
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            icon={<ChevronRight className="w-4 h-4" />}
          >
            السابق
          </Button>

          <span className="text-slate-300 font-medium px-2 font-mono">
            صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount() || 1}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}

