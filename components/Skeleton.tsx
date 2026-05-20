export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-[var(--color-surface-lift)] rounded animate-pulse ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <Skeleton className="h-5 w-40 mb-3" />
      <Skeleton className="h-3 w-28 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
