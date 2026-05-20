import { Skeleton, SkeletonCard } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-9 w-72 mb-2" />
      <Skeleton className="h-4 w-48 mb-3" />
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="h-24 mb-8" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} rows={2} />
        ))}
      </div>
    </div>
  );
}
