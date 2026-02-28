export function PantrySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 p-4 flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="h-6 bg-gray-100 rounded-full w-16" />
        </div>
      ))}
    </div>
  );
}

export function RecipeCardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 overflow-hidden"
        >
          <div className="h-48 bg-gray-200" />
          <div className="p-5">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
            <div className="flex gap-2 mt-4">
              <div className="h-6 bg-gray-100 rounded-full w-16" />
              <div className="h-6 bg-gray-100 rounded-full w-20" />
              <div className="h-6 bg-gray-100 rounded-full w-14" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShoppingListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
        >
          <div className="w-5 h-5 rounded border-2 border-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-40" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
      ))}
    </div>
  );
}
