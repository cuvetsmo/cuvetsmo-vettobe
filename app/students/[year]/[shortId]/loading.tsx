import { Skeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className="h-10 w-56 mb-2" />
      <Skeleton className="h-5 w-48 mb-1" />
      <Skeleton className="h-3 w-40 mb-8" />
      <div className="grid grid-cols-3 gap-3 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-6 w-24 mb-3" />
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12" />
        ))}
      </div>
    </div>
  );
}
