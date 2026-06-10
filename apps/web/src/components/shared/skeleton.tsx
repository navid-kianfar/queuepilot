import { cn } from '@/lib/utils';

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div style={style} className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

/**
 * Mirrors DataTable's layout exactly: toolbar (search input + export/action
 * buttons) and the table card with a header row and data rows, so the page
 * doesn't jump when real data arrives.
 */
export function TableSkeleton({
  columns,
  rows = 8,
  hasSelection = false,
  actionButtons = 0,
}: {
  columns: number;
  rows?: number;
  hasSelection?: boolean;
  actionButtons?: number;
}) {
  const cols = columns + (hasSelection ? 1 : 0);
  return (
    <div>
      {/* Toolbar — same heights as DataTable's search input and buttons */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <Skeleton className="h-[38px] w-full max-w-sm rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-[34px] w-[90px] rounded-lg" />
          {Array.from({ length: actionButtons }).map((_, i) => (
            <Skeleton key={i} className="h-[34px] w-32 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Table — same paddings as DataTable rows (px-4 py-3) */}
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <Skeleton className={cn('h-4', i === 0 && hasSelection ? 'w-3.5' : i <= (hasSelection ? 1 : 0) ? 'w-20' : 'w-12')} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r} className="border-b border-border last:border-0">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="px-4 py-3">
                    <Skeleton className={cn('h-5', c === 0 && hasSelection ? 'w-3.5' : c <= (hasSelection ? 1 : 0) ? 'w-32' : 'w-14')} />
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

/** Mirrors MetricCard: p-5 card with label + icon box, then the big value */
export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <div className="mt-3">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

/** The standard dashboard metric grid: 4 cards */
export function MetricCardsSkeleton() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Dashboard page header: title + subtitle line */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-2">
      <Skeleton className="my-1 h-5 w-44" />
      <Skeleton className="h-3 w-64" />
      <div className="mb-4" />
    </div>
  );
}

/** A chart card like the dashboard's Message Rates panel */
export function ChartCardSkeleton({ height = 240 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Skeleton className="mb-2 h-4 w-28" />
      <Skeleton className="w-full rounded-lg" style={{ height }} />
    </div>
  );
}

/** The card-embedded mini table used on dashboards (px-4 py-2.5 rows) */
export function MiniTableSkeleton({ columns, rows = 2 }: { columns: number; rows?: number }) {
  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <Skeleton className="h-4 w-16" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-4 py-2.5 text-left">
                <Skeleton className="h-3.5 w-14" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-b border-border last:border-0">
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-4 py-2.5">
                  <Skeleton className="h-4 w-16" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Detail page header: back link, title row with badges, action buttons */
export function DetailHeaderSkeleton({ actionButtons = 2 }: { actionButtons?: number }) {
  return (
    <div className="mb-6">
      <Skeleton className="mb-3 h-4 w-28" />
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-3 w-40" />
        </div>
        <div className="flex items-center gap-2">
          {Array.from({ length: actionButtons }).map((_, i) => (
            <Skeleton key={i} className="h-[30px] w-24 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Tab strip placeholder for detail pages */
export function TabsSkeleton({ tabs = 3 }: { tabs?: number }) {
  return (
    <div className="mb-4 flex items-center gap-2 border-b border-border pb-px">
      {Array.from({ length: tabs }).map((_, i) => (
        <Skeleton key={i} className="mb-2 h-6 w-20" />
      ))}
    </div>
  );
}

/** BullMQ dashboard queue card */
export function QueueCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted/50 p-2">
            <Skeleton className="mx-auto h-6 w-10" />
            <Skeleton className="mx-auto mt-1 h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Connection list card grid */
export function ConnectionCardsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-40 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1.5 h-3 w-20" />
            </div>
          </div>
          <Skeleton className="mt-4 h-3 w-40" />
          <div className="mt-4 flex items-center gap-2">
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
