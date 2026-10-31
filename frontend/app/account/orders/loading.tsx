export default function OrdersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-black/5 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
