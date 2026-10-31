export default function ProductsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />
      <div className="h-10 w-full max-w-md animate-pulse rounded bg-black/5 dark:bg-white/5" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
