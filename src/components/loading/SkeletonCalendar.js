/**
 * SkeletonCalendar Component
 * Skeleton loader for calendar grid view
 */

import Skeleton from './Skeleton';

export default function SkeletonCalendar() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Calendar header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-8 w-48" rounded="md" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" rounded="lg" />
            <Skeleton className="h-9 w-24" rounded="lg" />
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-8" rounded="md" />
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square border border-slate-200 rounded-lg p-2"
            >
              <Skeleton className="h-6 w-6 mb-2" rounded="md" />
              <div className="space-y-1">
                <Skeleton className="h-2 w-full" rounded="sm" />
                <Skeleton className="h-2 w-3/4" rounded="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
