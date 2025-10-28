/**
 * SkeletonCard Component
 * Skeleton loader for metric/stat cards
 */

import Skeleton from './Skeleton';

export default function SkeletonCard({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center gap-4">
            {/* Icon skeleton */}
            <Skeleton variant="circular" width="48px" height="48px" />

            {/* Content skeleton */}
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" rounded="md" />
              <Skeleton className="h-8 w-16" rounded="md" />
              <Skeleton className="h-3 w-24" rounded="md" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
