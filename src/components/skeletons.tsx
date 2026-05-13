import { Skeleton } from "@/components/ui/skeleton";

export const RealityCardSkeleton = () => (
  <div className="p-6 rounded-lg bg-card border border-border space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-3 w-1/2" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-5/6" />
  </div>
);

export const RealityCardSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <RealityCardSkeleton key={i} />
    ))}
  </div>
);

export const PostCardSkeleton = () => (
  <div className="p-6 rounded-lg bg-card border border-border space-y-3">
    <Skeleton className="aspect-video w-full rounded" />
    <Skeleton className="h-5 w-1/3 rounded-full" />
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const PostCardSkeletonGrid = ({ count = 3 }: { count?: number }) => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export const RealityDetailSkeleton = () => (
  <div className="py-12 editorial-container space-y-10">
    <Skeleton className="h-4 w-40" />
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-40" />
      </div>
      <Skeleton className="h-12 w-2/3" />
      <Skeleton className="h-4 w-full max-w-3xl" />
      <Skeleton className="h-4 w-3/4 max-w-3xl" />
    </div>
    <div className="grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  </div>
);

export const PostDetailSkeleton = () => (
  <div className="py-16 editorial-container max-w-3xl space-y-6">
    <Skeleton className="h-4 w-32" />
    <Skeleton className="h-6 w-28 rounded-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-3/4" />
    <div className="flex gap-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
    <Skeleton className="aspect-video w-full rounded-lg" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);
