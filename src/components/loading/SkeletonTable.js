/**
 * SkeletonTable Component
 * Skeleton loader for table/list views
 */

import Skeleton from './Skeleton';

export default function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 p-4">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={index} className="h-4 flex-1" rounded="md" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  <Skeleton
                    className={colIndex === 0 ? 'h-5 w-3/4' : 'h-4 w-2/3'}
                    rounded="md"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
