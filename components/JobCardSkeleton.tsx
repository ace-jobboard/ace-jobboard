export default function JobCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 border-t-4 border-t-gray-200 shadow-sm flex flex-col">
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl animate-shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 rounded-full animate-shimmer w-3/4" />
            <div className="h-3 rounded-full animate-shimmer w-1/2" />
          </div>
        </div>

        {/* Badges */}
        <div className="flex gap-1.5 mb-3">
          <div className="h-5 w-28 rounded-full animate-shimmer" />
          <div className="h-5 w-20 rounded-full animate-shimmer" />
          <div className="h-5 w-14 rounded-full animate-shimmer" />
        </div>

        {/* Location */}
        <div className="h-3 rounded-full animate-shimmer w-1/3 mb-3" />

        {/* Description lines */}
        <div className="space-y-2 flex-1">
          <div className="h-3 rounded-full animate-shimmer" />
          <div className="h-3 rounded-full animate-shimmer w-5/6" />
          <div className="h-3 rounded-full animate-shimmer w-4/6" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center px-5 py-3 border-t border-gray-50">
        <div className="h-3 w-16 rounded-full animate-shimmer" />
        <div className="h-7 w-20 rounded-lg animate-shimmer" />
      </div>
    </div>
  )
}
