export function ProductListSkeleton() {
  return (
    <div className="space-y-3 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse gap-3 rounded-xl2 bg-paper p-3 shadow-soft"
        >
          <div className="h-20 w-20 rounded-xl bg-sand" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/3 rounded bg-sand" />
            <div className="h-3 w-full rounded bg-sand" />
            <div className="h-6 w-1/3 rounded bg-sand" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl2 bg-paper p-4 shadow-soft">
          <div className="mb-2 h-4 w-1/3 rounded bg-sand" />
          <div className="mb-1 h-3 w-2/3 rounded bg-sand" />
          <div className="h-3 w-1/2 rounded bg-sand" />
        </div>
      ))}
    </div>
  );
}

export function Spinner({ className = "" }) {
  return (
    <div
      className={`h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
