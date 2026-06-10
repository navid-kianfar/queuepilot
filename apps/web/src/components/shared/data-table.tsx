import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  exportFilename?: string;
  enableSelection?: boolean;
  getRowId?: (row: T) => string;
  selectionActions?: (selected: T[], clearSelection: () => void) => React.ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  pageSize = 20,
  onRowClick,
  actions,
  exportFilename,
  enableSelection = false,
  getRowId,
  selectionActions,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<T, any> = {
    id: 'select',
    enableSorting: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all rows"
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={!table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected()}
        onChange={(v) => table.toggleAllPageRowsSelected(v)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={(v) => row.toggleSelected(v)}
        stopPropagation
      />
    ),
  };

  const allColumns = enableSelection ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    enableRowSelection: enableSelection,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const clearSelection = () => setRowSelection({});

  const handleExport = () => {
    if (!exportFilename) return;
    const headers = columns.map((c: any) => c.header || c.id || '').join(',');
    const rows = table.getFilteredRowModel().rows.map((row) =>
      row.getVisibleCells().filter((cell) => cell.column.id !== 'select').map((cell) => {
        const val = cell.getValue();
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : String(val ?? '');
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <Input
          className="flex-1 max-w-sm"
          icon={<Search className="h-3.5 w-3.5" />}
          type="text"
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <div className="flex items-center gap-2">
          {exportFilename && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          )}
          {actions}
        </div>
      </div>

      {/* Selection bar */}
      {enableSelection && selectedRows.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <span className="text-xs font-medium text-foreground">
            {selectedRows.length} selected
          </span>
          <div className="flex items-center gap-2">
            {selectionActions?.(selectedRows, clearSelection)}
            <button
              onClick={clearSelection}
              className="rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border bg-muted/50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground',
                      header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground',
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? <ArrowUp className="h-3 w-3" /> :
                        header.column.getIsSorted() === 'desc' ? <ArrowDown className="h-3 w-3" /> :
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={allColumns.length} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No results found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors hover:bg-muted/30',
                    onRowClick && 'cursor-pointer',
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {table.getFilteredRowModel().rows.length} total &middot; Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md border border-border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-md border border-border p-1.5 transition-colors hover:bg-accent disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
