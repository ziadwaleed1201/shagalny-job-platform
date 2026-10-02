export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-navy-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-navy-100 rounded w-2/3" />
          <div className="h-3 bg-navy-100 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-2 bg-navy-100 rounded w-1/2" />
            <div className="h-3 bg-navy-100 rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 pt-2">
        <div className="h-9 bg-navy-100 rounded flex-1" />
        <div className="h-9 bg-navy-100 rounded flex-1" />
      </div>
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-navy-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-navy-100 rounded w-1/3" />
            <div className="h-2 bg-navy-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="text-center py-10">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="font-semibold text-navy-800">{title}</p>
      {subtitle && <p className="text-sm text-navy-500 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
