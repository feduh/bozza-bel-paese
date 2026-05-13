import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lightweight visual placeholder while a lazy route chunk loads.
 * Mirrors the editorial container width to avoid layout shift.
 */
const RouteFallback = () => (
  <div className="editorial-container py-16" aria-busy="true" aria-live="polite">
    <Skeleton className="h-10 w-1/2 mb-6" />
    <Skeleton className="h-4 w-3/4 mb-3" />
    <Skeleton className="h-4 w-2/3 mb-10" />
    <div className="grid md:grid-cols-3 gap-6">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
  </div>
);

export default RouteFallback;
