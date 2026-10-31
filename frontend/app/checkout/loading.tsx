export default function CheckoutLoading() {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="h-8 w-48 animate-pulse rounded bg-black/5 dark:bg-white/5" />
      <div className="h-40 w-full animate-pulse rounded bg-black/5 dark:bg-white/5" />
      <div className="h-10 w-40 animate-pulse rounded bg-black/5 dark:bg-white/5" />
    </div>
  );
}
